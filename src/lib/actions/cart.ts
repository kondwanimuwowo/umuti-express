"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";

const addSchema = z.object({
  productId: z.coerce.number().int().positive(),
  pharmacyId: z.string().min(1),
  qty: z.coerce.number().int().min(1).max(99),
  /** Set after the customer confirms they want to drop a cart held at another pharmacy. */
  replace: z.boolean().optional(),
});

export type CartResult =
  | { ok: true; message: string }
  | { ok: false; error: string; code?: "OTHER_PHARMACY" };

export async function addToCart(input: {
  productId: number;
  pharmacyId: string;
  qty: number;
  replace?: boolean;
}): Promise<CartResult> {
  const { productId, pharmacyId, qty, replace } = addSchema.parse(input);
  const profile = await requireProfile(`/product/${productId}`);

  const listing = await prisma.pharmacyProduct.findUnique({
    where: { pharmacyId_productId: { pharmacyId, productId } },
    include: { product: true, pharmacy: true },
  });
  if (!listing || !listing.active || listing.product.status !== "APPROVED" || listing.pharmacy.status !== "ACTIVE") {
    return { ok: false, error: "That pharmacy no longer lists this product." };
  }
  if (listing.stock < 1) return { ok: false, error: "That product is out of stock at this pharmacy." };

  if (listing.product.classification === "PRESCRIPTION") {
    const approved = await prisma.prescription.findFirst({
      where: { profileId: profile.id, productId, status: "APPROVED" },
      select: { id: true },
    });
    if (!approved) return { ok: false, error: "This medicine needs an approved prescription first." };
  }

  // One pharmacy per cart: each order is fulfilled, and paid out, by a single pharmacy.
  const held = await prisma.cartItem.findFirst({
    where: { profileId: profile.id, pharmacyId: { not: pharmacyId } },
    include: { listing: { include: { pharmacy: true } } },
  });
  if (held) {
    if (!replace) {
      return {
        ok: false,
        code: "OTHER_PHARMACY",
        error: `Your cart has items from ${held.listing.pharmacy.name}. An order can only come from one pharmacy.`,
      };
    }
    await prisma.cartItem.deleteMany({ where: { profileId: profile.id } });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { profileId_productId: { profileId: profile.id, productId } },
  });
  if ((existing?.qty ?? 0) + qty > listing.stock) {
    return { ok: false, error: `Only ${listing.stock} in stock at ${listing.pharmacy.name}.` };
  }

  await prisma.cartItem.upsert({
    where: { profileId_productId: { profileId: profile.id, productId } },
    create: { profileId: profile.id, productId, pharmacyId, qty },
    update: { qty: { increment: qty } },
  });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { ok: true, message: "Added to cart" };
}

export async function changeCartQty(input: { productId: number; delta: number }) {
  const { productId, delta } = z
    .object({ productId: z.coerce.number().int().positive(), delta: z.coerce.number().int() })
    .parse(input);
  const profile = await requireProfile("/cart");

  const item = await prisma.cartItem.findUnique({
    where: { profileId_productId: { profileId: profile.id, productId } },
    include: { listing: true },
  });
  if (!item) return { ok: false as const, error: "That item is not in your cart." };

  const next = item.qty + delta;
  if (next < 1) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    if (next > item.listing.stock) {
      return { ok: false as const, error: `Only ${item.listing.stock} in stock.` };
    }
    await prisma.cartItem.update({ where: { id: item.id }, data: { qty: Math.min(next, 99) } });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function removeFromCart(input: { productId: number }) {
  const { productId } = z.object({ productId: z.coerce.number().int().positive() }).parse(input);
  const profile = await requireProfile("/cart");

  await prisma.cartItem.deleteMany({ where: { profileId: profile.id, productId } });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { ok: true as const, message: "Removed from cart" };
}

export async function reorder(input: { orderCode: string }): Promise<CartResult> {
  const { orderCode } = z.object({ orderCode: z.string().min(1) }).parse(input);
  const profile = await requireProfile("/account");

  const order = await prisma.order.findFirst({
    where: { code: orderCode, profileId: profile.id },
    include: { items: true },
  });
  if (!order?.pharmacyId) return { ok: false, error: "Order not found." };

  const held = await prisma.cartItem.findFirst({
    where: { profileId: profile.id, pharmacyId: { not: order.pharmacyId } },
  });
  if (held) return { ok: false, error: "Your cart has items from another pharmacy. Clear it first." };

  // Only what that pharmacy can still sell, in the quantity it has.
  const listings = await prisma.pharmacyProduct.findMany({
    where: {
      pharmacyId: order.pharmacyId,
      productId: { in: order.items.map((i) => i.productId) },
      active: true,
      stock: { gt: 0 },
      pharmacy: { status: "ACTIVE" },
      product: { status: "APPROVED", classification: { not: "PRESCRIPTION" } },
    },
  });
  const byProduct = new Map(listings.map((l) => [l.productId, l]));
  const lines = order.items.flatMap((item) => {
    const listing = byProduct.get(item.productId);
    return listing ? [{ productId: item.productId, qty: Math.min(item.qty, listing.stock) }] : [];
  });
  if (lines.length === 0) return { ok: false, error: "None of those items are available from that pharmacy right now." };

  await prisma.$transaction(
    lines.map((line) =>
      prisma.cartItem.upsert({
        where: { profileId_productId: { profileId: profile.id, productId: line.productId } },
        create: { profileId: profile.id, productId: line.productId, pharmacyId: order.pharmacyId!, qty: line.qty },
        update: { qty: line.qty },
      }),
    ),
  );

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  const skipped = order.items.length - lines.length;
  return {
    ok: true,
    message: skipped > 0 ? `${lines.length} items added; ${skipped} not available right now` : "Items added to your cart",
  };
}
