"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";

const idQty = z.object({ productId: z.coerce.number().int().positive(), qty: z.coerce.number().int().min(1).max(99) });

export async function addToCart(input: { productId: number; qty: number }) {
  const { productId, qty } = idQty.parse(input);
  const profile = await requireProfile(`/product/${productId}`);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { ok: false as const, error: "That product is no longer listed." };
  if (!product.inStock) return { ok: false as const, error: "That product is out of stock." };

  if (product.rx) {
    const approved = await prisma.prescription.findFirst({
      where: { profileId: profile.id, productId, status: "APPROVED" },
      select: { id: true },
    });
    if (!approved) return { ok: false as const, error: "This medicine needs an approved prescription first." };
  }

  await prisma.cartItem.upsert({
    where: { profileId_productId: { profileId: profile.id, productId } },
    create: { profileId: profile.id, productId, qty },
    update: { qty: { increment: qty } },
  });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { ok: true as const, message: "Added to cart" };
}

export async function changeCartQty(input: { productId: number; delta: number }) {
  const { productId, delta } = z
    .object({ productId: z.coerce.number().int().positive(), delta: z.coerce.number().int() })
    .parse(input);
  const profile = await requireProfile("/cart");

  const item = await prisma.cartItem.findUnique({
    where: { profileId_productId: { profileId: profile.id, productId } },
  });
  if (!item) return { ok: false as const, error: "That item is not in your cart." };

  const next = item.qty + delta;
  if (next < 1) await prisma.cartItem.delete({ where: { id: item.id } });
  else await prisma.cartItem.update({ where: { id: item.id }, data: { qty: Math.min(next, 99) } });

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

export async function reorder(input: { orderCode: string }) {
  const { orderCode } = z.object({ orderCode: z.string().min(1) }).parse(input);
  const profile = await requireProfile("/account");

  const order = await prisma.order.findFirst({
    where: { code: orderCode, profileId: profile.id },
    include: { items: true },
  });
  if (!order) return { ok: false as const, error: "Order not found." };

  await prisma.$transaction(
    order.items.map((item) =>
      prisma.cartItem.upsert({
        where: { profileId_productId: { profileId: profile.id, productId: item.productId } },
        create: { profileId: profile.id, productId: item.productId, qty: item.qty },
        update: { qty: { increment: item.qty } },
      }),
    ),
  );

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { ok: true as const, message: "Items added to your cart" };
}
