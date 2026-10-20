import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export const getCategories = cache(async () =>
  prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
);

export const getPharmacies = cache(async () => prisma.pharmacy.findMany({ orderBy: { name: "asc" } }));

export const getPharmacy = cache(async (id: string) =>
  prisma.pharmacy.findUnique({ where: { id } }),
);

export type ProductFilter = { q?: string; category?: string; take?: number };

/** A listing a customer can buy from: switched on, in stock, at an active pharmacy. */
const availableListing = { active: true, stock: { gt: 0 }, pharmacy: { status: "ACTIVE" } } as const;

const summaryInclude = {
  category: true,
  pharmacyProducts: { where: availableListing, select: { pharmacyId: true, priceNgwee: true } },
} satisfies Prisma.ProductInclude;

type SummaryRow = Prisma.ProductGetPayload<{ include: typeof summaryInclude }>;

/** A catalogue product with what its available listings add up to. */
export type ProductSummary = Omit<SummaryRow, "pharmacyProducts"> & {
  fromPriceNgwee: number;
  listingCount: number;
  /** Set only when exactly one pharmacy lists it, so a card can add to cart directly. */
  soleListingPharmacyId: string | null;
};

function toSummary({ pharmacyProducts, ...product }: SummaryRow): ProductSummary {
  return {
    ...product,
    fromPriceNgwee: Math.min(...pharmacyProducts.map((l) => l.priceNgwee)),
    listingCount: pharmacyProducts.length,
    soleListingPharmacyId: pharmacyProducts.length === 1 ? pharmacyProducts[0].pharmacyId : null,
  };
}

/**
 * Product ids matching a search, best first. Matches name, generic name and brand aliases,
 * by substring or trigram similarity, so "paracetamol" and "panado" both find Panadol.
 */
async function searchProductIds(q: string): Promise<number[]> {
  const term = q.trim().slice(0, 80);
  if (!term) return [];
  const like = `%${term.replace(/[\\%_]/g, "\\$&")}%`;

  const rows = await prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
    SELECT p.id
    FROM "Product" p
    WHERE p.status = 'APPROVED'
      AND (
        p.name ILIKE ${like}
        OR p."genericName" ILIKE ${like}
        OR EXISTS (SELECT 1 FROM unnest(p.aliases) a WHERE a ILIKE ${like})
        OR ${term} <% p.name
        OR ${term} <% p."genericName"
        OR EXISTS (SELECT 1 FROM unnest(p.aliases) a WHERE ${term} <% a)
      )
    ORDER BY GREATEST(
        word_similarity(${term}, p.name),
        word_similarity(${term}, COALESCE(p."genericName", '')),
        COALESCE((SELECT max(word_similarity(${term}, a)) FROM unnest(p.aliases) a), 0)
      ) DESC, p.name
    LIMIT 60
  `);
  return rows.map((r) => r.id);
}

export async function getProducts({ q, category, take }: ProductFilter = {}): Promise<ProductSummary[]> {
  const where: Prisma.ProductWhereInput = {
    status: "APPROVED",
    pharmacyProducts: { some: availableListing },
  };
  if (category) where.categorySlug = category;

  if (q?.trim()) {
    const ids = await searchProductIds(q);
    if (ids.length === 0) return [];
    where.id = { in: ids };
    const rows = await prisma.product.findMany({ where, include: summaryInclude });
    const rank = new Map(ids.map((id, i) => [id, i]));
    return rows
      .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
      .slice(0, take)
      .map(toSummary);
  }

  const rows = await prisma.product.findMany({ where, orderBy: { id: "asc" }, take, include: summaryInclude });
  return rows.map(toSummary);
}

/** A product with every pharmacy that lists it, cheapest first. Out-of-stock listings are kept, marked by stock 0. */
export const getProduct = cache(async (id: number) =>
  prisma.product.findFirst({
    where: { id, status: "APPROVED" },
    include: {
      category: true,
      pharmacyProducts: {
        where: { active: true, pharmacy: { status: "ACTIVE" } },
        orderBy: { priceNgwee: "asc" },
        include: { pharmacy: true },
      },
    },
  }),
);

export async function getRelatedProducts(categorySlug: string, excludeId: number, take = 3) {
  const rows = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      categorySlug,
      id: { not: excludeId },
      pharmacyProducts: { some: availableListing },
    },
    take,
    include: summaryInclude,
  });
  return rows.map(toSummary);
}

/** Other brands with the same active ingredient. */
export async function getSameIngredient(genericName: string | null, excludeId: number, take = 4) {
  if (!genericName) return [];
  const rows = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      genericName: { equals: genericName, mode: "insensitive" },
      id: { not: excludeId },
      pharmacyProducts: { some: availableListing },
    },
    take,
    include: summaryInclude,
  });
  return rows.map(toSummary);
}

export async function getCart(profileId: string) {
  const items = await prisma.cartItem.findMany({
    where: { profileId },
    orderBy: { createdAt: "asc" },
    include: { product: { include: { category: true } }, listing: { include: { pharmacy: true } } },
  });

  const pharmacy = items[0]?.listing.pharmacy ?? null;
  const subtotalNgwee = items.reduce((sum, i) => sum + i.listing.priceNgwee * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  // Lines that can no longer be bought as they stand: delisted, pharmacy paused, or stock below the quantity.
  const unavailableItems = items.filter(
    (i) => !i.listing.active || i.listing.pharmacy.status !== "ACTIVE" || i.listing.stock < i.qty,
  );

  // An Rx item may only be checked out once a pharmacist has approved a prescription for it.
  const rxProductIds = items.filter((i) => i.product.rx).map((i) => i.productId);
  const approved = rxProductIds.length
    ? await prisma.prescription.findMany({
        where: { profileId, productId: { in: rxProductIds }, status: "APPROVED" },
        select: { productId: true },
      })
    : [];
  const approvedIds = new Set(approved.map((p) => p.productId));
  const blockedItems = items.filter((i) => i.product.rx && !approvedIds.has(i.productId));

  return { items, count, pharmacy, subtotalNgwee, approvedIds, blockedItems, unavailableItems };
}

export async function getCartCount(profileId: string) {
  const rows = await prisma.cartItem.aggregate({ where: { profileId }, _sum: { qty: true } });
  return rows._sum.qty ?? 0;
}

export async function getOrders(profileId: string) {
  return prisma.order.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } }, pharmacy: true },
  });
}

export async function getOrder(profileId: string, code: string) {
  return prisma.order.findFirst({
    where: { code, profileId },
    include: {
      items: { include: { product: true } },
      pharmacy: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });
}

/** Most recent order, used as the default on /track. */
export async function getLatestOrder(profileId: string) {
  return prisma.order.findFirst({
    where: { profileId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: true } },
      pharmacy: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getPrescriptions(profileId: string, productId?: number) {
  return prisma.prescription.findMany({
    where: { profileId, ...(productId ? { productId } : {}) },
    orderBy: { createdAt: "desc" },
    include: { product: true, reviewer: { select: { fullName: true, email: true } } },
  });
}

/** The pharmacist review queue. Pending first, then recently decided. */
export async function getReviewQueue() {
  return prisma.prescription.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take: 50,
    include: {
      product: true,
      profile: { select: { fullName: true, email: true, phone: true } },
      reviewer: { select: { fullName: true, email: true } },
    },
  });
}

export async function getOrCreateThread(profileId: string) {
  const existing = await prisma.chatThread.findFirst({
    where: { profileId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (existing) return existing;

  return prisma.chatThread.create({
    data: {
      profileId,
      messages: {
        create: {
          authorRole: "PHARMACIST",
          body: "Hello, I'm Chanda, one of our pharmacists. How can I help you today?",
        },
      },
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}
