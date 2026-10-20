import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export const getCategories = cache(async () =>
  prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
);

/** Public pharmacies only: pending applications and suspended pharmacies stay hidden. */
export const getPharmacies = cache(async () =>
  prisma.pharmacy.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
);

export const getPharmacy = cache(async (id: string) =>
  prisma.pharmacy.findFirst({ where: { id, status: "ACTIVE" } }),
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
  /** Prescription-only: needs an approved prescription before it can be bought. */
  rx: boolean;
  fromPriceNgwee: number;
  listingCount: number;
  /** Set only when exactly one pharmacy lists it, so a card can add to cart directly. */
  soleListingPharmacyId: string | null;
};

function toSummary({ pharmacyProducts, ...product }: SummaryRow): ProductSummary {
  return {
    ...product,
    rx: product.classification === "PRESCRIPTION",
    fromPriceNgwee: Math.min(...pharmacyProducts.map((l) => l.priceNgwee)),
    listingCount: pharmacyProducts.length,
    soleListingPharmacyId: pharmacyProducts.length === 1 ? pharmacyProducts[0].pharmacyId : null,
  };
}

/**
 * Product ids matching a search, best first. Matches name, generic name and brand aliases,
 * by substring or trigram similarity, so "paracetamol" and "panado" both find Panadol.
 */
async function searchProductIds(q: string, pharmacyId?: string): Promise<number[]> {
  const term = q.trim().slice(0, 80);
  if (!term) return [];
  const like = `%${term.replace(/[\\%_]/g, "\\$&")}%`;
  // Customers see approved products. A pharmacy also sees its own products awaiting approval.
  const visible = pharmacyId
    ? Prisma.sql`(p.status = 'APPROVED' OR (p.status = 'PENDING' AND p."createdByPharmacyId" = ${pharmacyId}))`
    : Prisma.sql`p.status = 'APPROVED'`;

  const rows = await prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
    SELECT p.id
    FROM "Product" p
    WHERE ${visible}
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

export type CatalogueMatch = {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  packSize: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  /** This pharmacy already lists it. */
  listed: boolean;
};

/** Typeahead for a pharmacy adding stock: catalogue matches, flagged where it already lists them. */
export async function searchCatalogue(q: string, pharmacyId: string): Promise<CatalogueMatch[]> {
  const ids = (await searchProductIds(q, pharmacyId)).slice(0, 8);
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      genericName: true,
      strength: true,
      form: true,
      packSize: true,
      status: true,
      pharmacyProducts: { where: { pharmacyId }, select: { id: true } },
    },
  });
  const rank = new Map(ids.map((id, i) => [id, i]));
  return rows
    .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
    .map(({ pharmacyProducts, ...p }) => ({ ...p, listed: pharmacyProducts.length > 0 }));
}

/** Everything a pharmacy lists, including products still waiting for approval. */
export async function getPharmacyListings(pharmacyId: string) {
  return prisma.pharmacyProduct.findMany({
    where: { pharmacyId },
    orderBy: { product: { name: "asc" } },
    include: { product: { include: { category: true } } },
  });
}

/** Products awaiting admin approval, oldest first. */
export async function getCatalogueQueue() {
  return prisma.product.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { category: true, createdByPharmacy: { select: { name: true } } },
  });
}

/** Approved products for admin to find and re-classify. */
export async function searchApprovedProducts(q: string) {
  const ids = await searchProductIds(q);
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { category: true, createdByPharmacy: { select: { name: true } } },
  });
  const rank = new Map(ids.map((id, i) => [id, i]));
  return rows.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0)).slice(0, 20);
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

  // Prescription items are allowed in the cart. The customer uploads the prescription at checkout
  // and the pharmacy reviews it before anything is charged.
  const rxItems = items.filter((i) => i.product.classification === "PRESCRIPTION");

  return { items, count, pharmacy, subtotalNgwee, rxItems, unavailableItems };
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
      prescriptions: { select: { id: true, status: true, note: true, product: { select: { name: true } } } },
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
      prescriptions: { select: { id: true, status: true, note: true, product: { select: { name: true } } } },
    },
  });
}

export async function getPrescriptions(profileId: string, productId?: number) {
  return prisma.prescription.findMany({
    where: { profileId, ...(productId ? { productId } : {}) },
    orderBy: { createdAt: "desc" },
    include: { product: true, order: { select: { code: true } }, reviewer: { select: { fullName: true, email: true } } },
  });
}

/**
 * The prescription review queue for one pharmacy: only prescriptions uploaded for an order
 * placed with that pharmacy. A pharmacy with no order never sees a prescription.
 */
export async function getReviewQueue(pharmacyId: string) {
  return prisma.prescription.findMany({
    where: { order: { pharmacyId } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take: 50,
    include: {
      product: true,
      order: { select: { code: true } },
      profile: { select: { fullName: true, email: true, phone: true } },
      reviewer: { select: { fullName: true, email: true } },
    },
  });
}

/** Whether a prescription may be opened or decided by this pharmacy's staff: it belongs to one of its orders. */
export async function prescriptionVisibleTo(pharmacyId: string, where: Prisma.PrescriptionWhereInput) {
  return prisma.prescription.findFirst({
    where: { AND: [where, { order: { pharmacyId } }] },
    include: { order: { select: { id: true, code: true, status: true } } },
  });
}

export type OrderView = "active" | "done";

const ACTIVE_STATUSES = ["PREPARING", "READY", "OUT_FOR_DELIVERY"] as const;

/** One pharmacy's orders. Customers' contact details are included: the pharmacy needs them to fulfil. */
export async function getPharmacyOrders(pharmacyId: string, view: OrderView) {
  return prisma.order.findMany({
    where: {
      pharmacyId,
      status: view === "active" ? { in: [...ACTIVE_STATUSES] } : { in: ["COMPLETED", "CANCELLED"] },
    },
    orderBy: { createdAt: view === "active" ? "asc" : "desc" },
    take: 100,
    include: { items: true, profile: { select: { fullName: true } } },
  });
}

/** What is waiting on a pharmacy's staff: shown as badges in the dashboard navigation. */
export const getStaffCounts = cache(async (pharmacyId: string) => {
  const [orders, prescriptions, threads] = await Promise.all([
    prisma.order.count({ where: { pharmacyId, status: { in: [...ACTIVE_STATUSES] } } }),
    prisma.prescription.count({ where: { status: "PENDING", order: { pharmacyId, status: "AWAITING_REVIEW" } } }),
    prisma.chatThread.findMany({
      where: threadsVisibleTo(pharmacyId),
      orderBy: { updatedAt: "desc" },
      take: 25,
      select: { messages: { orderBy: { createdAt: "desc" }, take: 1, select: { authorRole: true } } },
    }),
  ]);
  const chats = threads.filter((t) => t.messages[0]?.authorRole === "CUSTOMER").length;
  return { orders, prescriptions, chats };
});

export async function getPharmacyOrderCounts(pharmacyId: string) {
  const [active, done] = await Promise.all([
    prisma.order.count({ where: { pharmacyId, status: { in: [...ACTIVE_STATUSES] } } }),
    prisma.order.count({ where: { pharmacyId, status: { in: ["COMPLETED", "CANCELLED"] } } }),
  ]);
  return { active, done };
}

/**
 * Chat threads a pharmacy may see: customers who ordered from it or chose it as their pharmacy.
 * Chat has no pharmacy of its own yet; consultations replace it in Phase 8.
 */
export function threadsVisibleTo(pharmacyId: string): Prisma.ChatThreadWhereInput {
  return {
    profile: { OR: [{ preferredPharmacyId: pharmacyId }, { orders: { some: { pharmacyId } } }] },
  };
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

/** A pharmacist's verification record with the documents they have submitted. */
export async function getPharmacistProfile(profileId: string) {
  return prisma.pharmacistProfile.findUnique({
    where: { profileId },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });
}

/** Pharmacist applications waiting for admin, oldest first. */
export async function getPendingPharmacists() {
  return prisma.pharmacistProfile.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      documents: { orderBy: { createdAt: "desc" } },
      profile: { select: { fullName: true, email: true, phone: true, pharmacy: { select: { name: true } } } },
    },
  });
}
