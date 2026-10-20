"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff";
import { prescriptionVisibleTo } from "@/lib/queries";
import { getVerificationState } from "@/lib/verification";
import { logAccess } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRESCRIPTION_BUCKET } from "@/lib/storage";

const SIGNED_URL_SECONDS = 60;

const NOT_VERIFIED = "Only a verified pharmacist can review prescriptions. Submit your documents under Verification.";

/**
 * Decision on a prescription uploaded for one of this pharmacy's orders. Only a verified pharmacist
 * can decide. When every prescription on the order is approved the order moves on to payment;
 * one refusal cancels the order and returns the reserved stock.
 */
export async function reviewPrescription(input: { id: string; decision: "APPROVED" | "REJECTED"; note?: string }) {
  const { id, decision, note } = z
    .object({
      id: z.string().min(1),
      decision: z.enum(["APPROVED", "REJECTED"]),
      note: z.string().max(500).optional(),
    })
    .parse(input);

  const { profile: reviewer, pharmacy } = await requireStaff("/dashboard/prescriptions");
  if ((await getVerificationState(reviewer.id)).state !== "VERIFIED") return { ok: false as const, error: NOT_VERIFIED };

  const rx = await prescriptionVisibleTo(pharmacy.id, { id });
  if (!rx || !rx.order) return { ok: false as const, error: "Prescription not found." };
  if (rx.status !== "PENDING") return { ok: false as const, error: "That prescription was already reviewed." };
  if (rx.order.status !== "AWAITING_REVIEW") return { ok: false as const, error: "That order is no longer waiting for review." };
  if (decision === "REJECTED" && !note?.trim()) {
    return { ok: false as const, error: "Give the patient a reason when not approving." };
  }

  const orderId = rx.order.id;
  const reason = note?.trim() || null;

  await prisma.$transaction(async (tx) => {
    await tx.prescription.update({
      where: { id },
      data: { status: decision, note: reason, reviewerId: reviewer.id, reviewedAt: new Date(), pharmacyId: pharmacy.id },
    });
    await tx.accessLog.create({
      data: { actorId: reviewer.id, action: `prescription.${decision.toLowerCase()}`, subjectType: "Prescription", subjectId: id },
    });

    if (decision === "REJECTED") {
      // One refusal ends the order: close what is still open on it and give the stock back.
      await tx.prescription.updateMany({
        where: { orderId, status: "PENDING" },
        data: { status: "REJECTED", note: "Order cancelled", reviewerId: reviewer.id, reviewedAt: new Date() },
      });
      const items = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of items) {
        await tx.pharmacyProduct.updateMany({
          where: { pharmacyId: pharmacy.id, productId: item.productId },
          data: { stock: { increment: item.qty } },
        });
      }
      await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
      await tx.orderEvent.create({
        data: { orderId, status: "CANCELLED", note: `Prescription not approved: ${reason}` },
      });
      return;
    }

    const stillPending = await tx.prescription.count({ where: { orderId, status: "PENDING" } });
    if (stillPending === 0) {
      await tx.order.update({ where: { id: orderId }, data: { status: "AWAITING_PAYMENT" } });
      await tx.orderEvent.create({
        data: { orderId, status: "AWAITING_PAYMENT", note: "Prescription approved. Ready for payment." },
      });
    }
  });

  revalidatePath("/dashboard/prescriptions");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/track");
  return { ok: true as const, message: decision === "APPROVED" ? "Approved" : "Marked as not approved" };
}

/**
 * A link that lasts a minute, for one prescription belonging to one of this pharmacy's orders.
 * Every call is written to the access log. The link is signed with the service key after the
 * order check, so staff have no direct read access to the bucket.
 */
export async function getPrescriptionUrl(id: string) {
  const { profile, pharmacy } = await requireStaff("/dashboard/prescriptions");
  if ((await getVerificationState(profile.id)).state !== "VERIFIED") return null;

  const rx = await prescriptionVisibleTo(pharmacy.id, { id });
  if (!rx) return null;

  await logAccess(profile.id, "prescription.view", "Prescription", rx.id);

  const { data } = await createAdminClient().storage.from(PRESCRIPTION_BUCKET).createSignedUrl(rx.imagePath, SIGNED_URL_SECONDS);
  return data?.signedUrl ?? null;
}
