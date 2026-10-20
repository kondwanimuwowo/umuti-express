"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { requireStaff } from "@/lib/staff";
import { getCart } from "@/lib/queries";
import { DELIVERY_STAGES, PICKUP_STAGES } from "@/lib/format";
import { chargeMobileMoney } from "@/lib/payments";
import { checkUpload, fileExtension } from "@/lib/uploads";
import { PRESCRIPTION_BUCKET } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { recordAcceptance } from "@/lib/legal";
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
  consent: z.literal(true, { error: "Agree to the terms and to sharing your details with the pharmacy to place the order." }),
});

class StockError extends Error {}

function orderCode() {
  return "UM-" + Math.floor(10000 + Math.random() * 90000);
}

/**
 * Checkout. An order with no prescription items is charged straight away. One with prescription
 * items is placed without charging: the customer uploads the prescription here, the pharmacy
 * holding the order reviews it, and the customer pays once it is approved.
 */
export async function placeOrder(formData: FormData) {
  const profile = await requireProfile("/checkout");
  const parsed = checkoutSchema.safeParse({
    fulfilment: formData.get("fulfilment"),
    paymentMethod: formData.get("paymentMethod"),
    phone: formData.get("phone"),
    address: formData.get("address") || undefined,
    consent: formData.get("consent") === "on",
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Check your details." };
  }
  const { consent: _consent, ...input } = parsed.data;

  if (input.fulfilment === "DELIVERY" && !input.address?.trim()) {
    return { ok: false as const, error: "Enter the delivery address." };
  }

  const cart = await getCart(profile.id);
  if (cart.items.length === 0 || !cart.pharmacy) return { ok: false as const, error: "Your cart is empty." };
  const pharmacy = cart.pharmacy;

  // Placing an order is also acceptance of the current terms and privacy policy.
  await recordAcceptance({ profileId: profile.id, types: ["TERMS", "PRIVACY"] });

  if (input.fulfilment === "DELIVERY" && !pharmacy.offersDelivery) {
    return { ok: false as const, error: `${pharmacy.name} does not offer delivery. Choose pickup.` };
  }
  if (cart.unavailableItems.length > 0) {
    const names = cart.unavailableItems.map((i) => i.product.name).join(", ");
    return { ok: false as const, error: `No longer available in that quantity: ${names}. Update your cart.` };
  }

  // A prescription is required server-side whenever the cart holds a prescription item.
  const needsPrescription = cart.rxItems.length > 0;
  let prescriptionFile: File | null = null;
  if (needsPrescription) {
    const checked = checkUpload(formData.get("prescription"), "prescription");
    if ("error" in checked) return { ok: false as const, error: checked.error };
    prescriptionFile = checked.file;
  }

  let prescriptionPath: string | null = null;
  if (prescriptionFile) {
    prescriptionPath = `${profile.id}/order-${Date.now()}.${fileExtension(prescriptionFile)}`;
    const supabase = await createClient();
    const { error } = await supabase.storage.from(PRESCRIPTION_BUCKET).upload(prescriptionPath, prescriptionFile, {
      contentType: prescriptionFile.type,
      upsert: false,
    });
    if (error) return { ok: false as const, error: "Upload failed. Please try again." };
  }

  // Delivery is arranged with the pharmacy and paid on arrival, so the total is medicines only.
  const totalNgwee = cart.subtotalNgwee;
  const startStatus: OrderStatus = needsPrescription ? "AWAITING_REVIEW" : "AWAITING_PAYMENT";

  // Reserve stock and create the order before charging, so a customer is never charged for
  // stock another order took. The conditional decrement is atomic: it only succeeds while enough remains.
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const reserved = await tx.pharmacyProduct.updateMany({
          where: { pharmacyId: pharmacy.id, productId: item.productId, active: true, stock: { gte: item.qty } },
          data: { stock: { decrement: item.qty } },
        });
        if (reserved.count === 0) throw new StockError(item.product.name);
      }

      return tx.order.create({
        data: {
          code: orderCode(),
          profileId: profile.id,
          pharmacyId: pharmacy.id,
          fulfilment: input.fulfilment,
          paymentMethod: input.paymentMethod,
          paymentStatus: "PENDING",
          phone: input.phone,
          address: input.fulfilment === "DELIVERY" ? input.address?.trim() : null,
          subtotalNgwee: cart.subtotalNgwee,
          totalNgwee,
          sharingConsentAt: new Date(),
          status: startStatus,
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              qty: i.qty,
              unitPriceNgwee: i.listing.priceNgwee,
              nameAtPurchase: i.product.name,
            })),
          },
          events: {
            create: {
              status: startStatus,
              note: needsPrescription ? "Prescription sent to the pharmacy for review" : undefined,
            },
          },
          ...(prescriptionPath && {
            prescriptions: {
              create: cart.rxItems.map((i) => ({
                profileId: profile.id,
                productId: i.productId,
                imagePath: prescriptionPath,
                pharmacyId: pharmacy.id,
              })),
            },
          }),
        },
      });
    });
  } catch (e) {
    if (prescriptionPath) await (await createClient()).storage.from(PRESCRIPTION_BUCKET).remove([prescriptionPath]);
    if (e instanceof StockError) {
      return { ok: false as const, error: `${e.message} just sold out. Update your cart.` };
    }
    throw e;
  }

  if (needsPrescription) {
    await prisma.cartItem.deleteMany({ where: { profileId: profile.id } });
    revalidatePath("/account");
    revalidatePath("/cart");
    revalidatePath("/dashboard", "layout");
    redirect(`/order/confirmation?code=${order.code}`);
  }

  const payment = await chargeMobileMoney({
    method: input.paymentMethod,
    phone: input.phone,
    amountNgwee: totalNgwee,
  });

  if (!payment.ok) {
    await cancelAndRelease(order.id, pharmacy.id, "Payment failed", "FAILED");
    return { ok: false as const, error: payment.error };
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PREPARING", paymentStatus: "PAID", paymentRef: payment.reference },
    }),
    prisma.orderEvent.create({ data: { orderId: order.id, status: "PREPARING", note: "Payment received" } }),
    prisma.cartItem.deleteMany({ where: { profileId: profile.id } }),
  ]);

  revalidatePath("/account");
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect(`/order/confirmation?code=${order.code}`);
}

/** Close an unpaid order and give its reserved stock back. */
async function cancelAndRelease(orderId: string, pharmacyId: string, note: string, paymentStatus?: "FAILED") {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  await prisma.$transaction([
    ...items.map((i) =>
      prisma.pharmacyProduct.updateMany({
        where: { pharmacyId, productId: i.productId },
        data: { stock: { increment: i.qty } },
      }),
    ),
    prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED", ...(paymentStatus && { paymentStatus }) } }),
    prisma.orderEvent.create({ data: { orderId, status: "CANCELLED", note } }),
  ]);
}

/** Pay for an order whose prescription the pharmacy has approved. */
export async function payForOrder(input: { code: string }) {
  const { code } = z.object({ code: z.string().min(1) }).parse(input);
  const profile = await requireProfile("/track");

  const order = await prisma.order.findFirst({ where: { code, profileId: profile.id } });
  if (!order) return { ok: false as const, error: "Order not found." };
  if (order.status !== "AWAITING_PAYMENT" || order.paymentStatus === "PAID") {
    return { ok: false as const, error: "This order is not waiting for payment." };
  }

  const payment = await chargeMobileMoney({
    method: order.paymentMethod,
    phone: order.phone,
    amountNgwee: order.totalNgwee,
  });
  if (!payment.ok) return { ok: false as const, error: payment.error };

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PREPARING", paymentStatus: "PAID", paymentRef: payment.reference },
    }),
    prisma.orderEvent.create({ data: { orderId: order.id, status: "PREPARING", note: "Payment received" } }),
  ]);

  revalidatePath("/track");
  revalidatePath("/account");
  revalidatePath("/dashboard", "layout");
  return { ok: true as const };
}

/** A customer withdraws an order that has not been paid for yet. */
export async function cancelOrder(input: { code: string }) {
  const { code } = z.object({ code: z.string().min(1) }).parse(input);
  const profile = await requireProfile("/track");

  const order = await prisma.order.findFirst({ where: { code, profileId: profile.id } });
  if (!order || !order.pharmacyId) return { ok: false as const, error: "Order not found." };
  if (order.status !== "AWAITING_REVIEW" && order.status !== "AWAITING_PAYMENT") {
    return { ok: false as const, error: "This order can no longer be cancelled here." };
  }

  await cancelAndRelease(order.id, order.pharmacyId, "Cancelled by the customer");
  await prisma.prescription.updateMany({ where: { orderId: order.id, status: "PENDING" }, data: { status: "REJECTED", note: "Order cancelled" } });

  revalidatePath("/track");
  revalidatePath("/account");
  revalidatePath("/dashboard", "layout");
  return { ok: true as const };
}

/** Staff action: move one of their own pharmacy's orders to its next tracking stage. */
export async function advanceOrder(input: { code: string }) {
  const { code } = z.object({ code: z.string().min(1) }).parse(input);
  const { pharmacy } = await requireStaff("/dashboard/orders");

  // Scoped to the staff member's pharmacy, so another pharmacy's order reads as not found.
  const order = await prisma.order.findFirst({ where: { code, pharmacyId: pharmacy.id } });
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
  revalidatePath("/dashboard/orders");
  return { ok: true as const };
}
