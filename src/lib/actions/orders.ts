"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile, requireRole } from "@/lib/auth";
import { getCart, deliveryFeeFor } from "@/lib/queries";
import { DELIVERY_STAGES, PICKUP_STAGES } from "@/lib/format";
import { chargeMobileMoney } from "@/lib/payments";
import type { OrderStatus } from "@/generated/prisma";

const checkoutSchema = z.object({
  fulfilment: z.enum(["DELIVERY", "PICKUP"]),
  paymentMethod: z.enum(["MTN", "AIRTEL"]),
  // Zambian mobile numbers: 09x/07x locally or +260 9x/7x.
  phone: z
    .string()
    .trim()
    .regex(/^(\+?260|0)(9[5-7]|7[5-7])\d{7}$/, "Enter a valid MTN or Airtel number, e.g. 0977123456"),
  address: z.string().trim().max(300).optional(),
  pharmacyId: z.string().trim().optional(),
});

function orderCode() {
  return "UM-" + Math.floor(10000 + Math.random() * 90000);
}

export async function placeOrder(raw: unknown) {
  const profile = await requireProfile("/checkout");
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Check your details." };
  }
  const input = parsed.data;

  if (input.fulfilment === "DELIVERY" && !input.address?.trim()) {
    return { ok: false as const, error: "Enter the delivery address." };
  }
  if (input.fulfilment === "PICKUP" && !input.pharmacyId) {
    return { ok: false as const, error: "Choose a pharmacy to pick up from." };
  }

  const cart = await getCart(profile.id);
  if (cart.items.length === 0) return { ok: false as const, error: "Your cart is empty." };

  // Server-side re-check: an Rx item cannot be bought without pharmacist approval,
  // regardless of what the client sent.
  if (cart.blockedItems.length > 0) {
    const names = cart.blockedItems.map((i) => i.product.name).join(", ");
    return { ok: false as const, error: `Awaiting pharmacist approval for: ${names}.` };
  }

  const deliveryNgwee = deliveryFeeFor(input.fulfilment);
  const totalNgwee = cart.subtotalNgwee + deliveryNgwee;

  const payment = await chargeMobileMoney({
    method: input.paymentMethod,
    phone: input.phone,
    amountNgwee: totalNgwee,
  });
  if (!payment.ok) return { ok: false as const, error: payment.error };

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        code: orderCode(),
        profileId: profile.id,
        fulfilment: input.fulfilment,
        paymentMethod: input.paymentMethod,
        paymentStatus: "PAID",
        paymentRef: payment.reference,
        phone: input.phone,
        address: input.fulfilment === "DELIVERY" ? input.address?.trim() : null,
        pharmacyId: input.fulfilment === "PICKUP" ? input.pharmacyId : null,
        subtotalNgwee: cart.subtotalNgwee,
        deliveryNgwee,
        totalNgwee,
        status: "PREPARING",
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            qty: i.qty,
            unitPriceNgwee: i.product.priceNgwee,
            nameAtPurchase: i.product.name,
          })),
        },
        events: { create: { status: "PREPARING", note: "Payment received" } },
      },
    });

    await tx.cartItem.deleteMany({ where: { profileId: profile.id } });
    return created;
  });

  revalidatePath("/account");
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect(`/order/confirmation?code=${order.code}`);
}

/** Staff action: move an order to its next tracking stage. */
export async function advanceOrder(input: { code: string }) {
  const { code } = z.object({ code: z.string().min(1) }).parse(input);
  await requireRole(["PHARMACIST", "ADMIN"], "/pharmacist");

  const order = await prisma.order.findUnique({ where: { code } });
  if (!order) return { ok: false as const, error: "Order not found." };

  const stages: readonly OrderStatus[] =
    order.fulfilment === "DELIVERY" ? DELIVERY_STAGES : PICKUP_STAGES;
  const at = stages.indexOf(order.status);
  if (at === -1 || at === stages.length - 1) {
    return { ok: false as const, error: "That order is already complete." };
  }
  const next = stages[at + 1];

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: next } }),
    prisma.orderEvent.create({ data: { orderId: order.id, status: next } }),
  ]);

  revalidatePath("/track");
  revalidatePath("/account");
  revalidatePath("/pharmacist");
  return { ok: true as const };
}
