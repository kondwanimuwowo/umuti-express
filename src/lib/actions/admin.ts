"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/staff";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_BUCKET } from "@/lib/storage";
import { logAccess } from "@/lib/audit";
import { hasAcceptedCurrent } from "@/lib/legal";

const reviewSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["ACTIVE", "SUSPENDED"]),
  note: z.string().trim().max(500).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

/**
 * Admin decision on a pharmacy: activate it (publishing it and giving its owner staff access),
 * or suspend / reject it with a reason.
 */
export async function reviewPharmacy(input: z.input<typeof reviewSchema>) {
  const { id, decision, note, lat, lng } = reviewSchema.parse(input);
  await requireAdmin();

  const pharmacy = await prisma.pharmacy.findUnique({ where: { id } });
  if (!pharmacy) return { ok: false as const, error: "Pharmacy not found." };

  if (decision === "SUSPENDED" && !note) {
    return { ok: false as const, error: "Give the pharmacy a reason." };
  }
  if (decision === "ACTIVE" && (lat === undefined || lng === undefined)) {
    return { ok: false as const, error: "Set the pharmacy's map location before activating it." };
  }

  if (decision === "ACTIVE") {
    const owner = await prisma.profile.findFirst({ where: { pharmacyId: id, isPharmacyOwner: true }, select: { id: true } });
    if (!owner || !(await hasAcceptedCurrent(owner.id, "PARTNER"))) {
      return { ok: false as const, error: "The pharmacy has not accepted the current Partner Agreement." };
    }
  }

  await prisma.$transaction([
    prisma.pharmacy.update({
      where: { id },
      data: {
        status: decision,
        reviewNote: note || null,
        ...(decision === "ACTIVE" ? { lat, lng } : {}),
      },
    }),
    // Owners only get staff access once the pharmacy is live. Suspending takes it back.
    prisma.profile.updateMany({
      where: { pharmacyId: id, isPharmacyOwner: true, role: { not: "ADMIN" } },
      data: { role: decision === "ACTIVE" ? "PHARMACIST" : "CUSTOMER" },
    }),
  ]);

  revalidatePath("/dashboard/admin");
  revalidatePath("/pharmacies");
  return { ok: true as const, message: decision === "ACTIVE" ? "Pharmacy activated" : "Pharmacy suspended" };
}

/** A short-lived link to one of a pharmacy's verification documents. */
export async function getDocumentUrl(path: string) {
  const admin = await requireAdmin();
  const known = await prisma.verificationDocument.findFirst({ where: { filePath: path }, select: { id: true } });
  if (!known) return null;

  await logAccess(admin.id, "document.view", "VerificationDocument", known.id);

  const supabase = await createClient();
  const { data } = await supabase.storage.from(DOCUMENT_BUCKET).createSignedUrl(path, 60 * 5);
  return data?.signedUrl ?? null;
}
