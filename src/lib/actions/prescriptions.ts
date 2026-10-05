"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile, requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "prescriptions";
const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/**
 * A customer uploads a prescription photo for one Rx product. It lands in
 * PENDING; only a pharmacist can approve it (see `reviewPrescription`).
 */
export async function uploadPrescription(formData: FormData) {
  const productId = z.coerce.number().int().positive().parse(formData.get("productId"));
  const file = formData.get("file");
  const profile = await requireProfile(`/product/${productId}`);

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "Choose a photo of your prescription." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false as const, error: "That file is larger than 8MB." };
  }
  if (!ACCEPTED.includes(file.type)) {
    return { ok: false as const, error: "Upload a JPEG, PNG, WebP or PDF." };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product?.rx) return { ok: false as const, error: "That product does not need a prescription." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${profile.id}/${productId}-${Date.now()}.${ext}`;

  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { ok: false as const, error: "Upload failed. Please try again." };

  await prisma.prescription.create({
    data: { profileId: profile.id, productId, imagePath: path, status: "PENDING" },
  });

  revalidatePath(`/product/${productId}`);
  revalidatePath(`/prescription/${productId}`);
  revalidatePath("/pharmacist");
  return { ok: true as const, message: "Sent to a pharmacist for review" };
}

/**
 * Pharmacist-only decision. This is the gate that stops a patient approving
 * their own prescription for a controlled item.
 */
export async function reviewPrescription(input: { id: string; decision: "APPROVED" | "REJECTED"; note?: string }) {
  const { id, decision, note } = z
    .object({
      id: z.string().min(1),
      decision: z.enum(["APPROVED", "REJECTED"]),
      note: z.string().max(500).optional(),
    })
    .parse(input);

  const reviewer = await requireRole(["PHARMACIST", "ADMIN"], "/pharmacist");

  const rx = await prisma.prescription.findUnique({ where: { id } });
  if (!rx) return { ok: false as const, error: "Prescription not found." };
  if (rx.status !== "PENDING") return { ok: false as const, error: "That prescription was already reviewed." };
  if (decision === "REJECTED" && !note?.trim()) {
    return { ok: false as const, error: "Give the patient a reason when not approving." };
  }

  await prisma.prescription.update({
    where: { id },
    data: {
      status: decision,
      note: note?.trim() || null,
      reviewerId: reviewer.id,
      reviewedAt: new Date(),
      pharmacyId: reviewer.pharmacyId,
    },
  });

  revalidatePath("/pharmacist");
  revalidatePath("/cart");
  revalidatePath(`/prescription/${rx.productId}`);
  return { ok: true as const, message: decision === "APPROVED" ? "Approved" : "Marked as not approved" };
}

/** A signed, short-lived URL so a pharmacist can view an uploaded prescription. */
export async function getPrescriptionUrl(path: string) {
  await requireRole(["PHARMACIST", "ADMIN"], "/pharmacist");
  const supabase = await createClient();
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 5);
  return data?.signedUrl ?? null;
}
