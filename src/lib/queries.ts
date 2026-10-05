import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DELIVERY_FEE_NGWEE } from "@/lib/format";
import type { Prisma } from "@/generated/prisma";

export const getCategories = cache(async () =>
  prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
);

export const getPharmacies = cache(async () => prisma.pharmacy.findMany({ orderBy: { name: "asc" } }));

export const getPharmacy = cache(async (id: string) =>
  prisma.pharmacy.findUnique({ where: { id } }),
);

export type ProductFilter = { q?: string; category?: string; take?: number };

export async function getProducts({ q, category, take }: ProductFilter = {}) {
  const where: Prisma.ProductWhereInput = {};
  if (category) where.categorySlug = category;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { blurb: { contains: q, mode: "insensitive" } },
    ];
  }
  return prisma.product.findMany({
    where,
    orderBy: { id: "asc" },
    take,
    include: { category: true },
  });
}

export const getProduct = cache(async (id: number) =>
  prisma.product.findUnique({ where: { id }, include: { category: true } }),
);

export async function getRelatedProducts(categorySlug: string, excludeId: number, take = 3) {
  return prisma.product.findMany({
    where: { categorySlug, id: { not: excludeId } },
    take,
    include: { category: true },
  });
}

export async function getCart(profileId: string) {
  const items = await prisma.cartItem.findMany({
    where: { profileId },
    orderBy: { createdAt: "asc" },
    include: { product: { include: { category: true } } },
  });

  const subtotalNgwee = items.reduce((sum, i) => sum + i.product.priceNgwee * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

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

  return { items, count, subtotalNgwee, approvedIds, blockedItems };
}

export async function getCartCount(profileId: string) {
  const rows = await prisma.cartItem.aggregate({ where: { profileId }, _sum: { qty: true } });
  return rows._sum.qty ?? 0;
}

export function deliveryFeeFor(fulfilment: "DELIVERY" | "PICKUP") {
  return fulfilment === "DELIVERY" ? DELIVERY_FEE_NGWEE : 0;
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
