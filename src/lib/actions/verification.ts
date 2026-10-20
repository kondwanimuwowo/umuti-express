"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, requireAdmin } from "@/lib/staff";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_BUCKET } from "@/lib/storage";
import { checkUpload, fileExtension } from "@/lib/uploads";
import { getVerificationState } from "@/lib/verification";
import type { DocumentType } from "@/generated/prisma";

type Result = { ok: true; message: string } | { ok: false; error: string };

const submitSchema = z.object({
  registrationNumber: z.string().trim().min(3, "Enter your registration number.").max(40),
  certificateExpiry: z.coerce.date({ error: "Enter the expiry date on your practising certificate." }),
});

/**
 * A pharmacist submits their licence and practising certificate. Nothing unlocks until an admin
 * has checked them, and the certificate's expiry date decides how long the verification lasts.
 */
export async function submitVerification(formData: FormData): Promise<Result> {
  const { profile } = await requireStaff("/dashboard/verification");

  const current = await getVerificationState(profile.id);
  if (current.state === "VERIFIED") return { ok: false, error: "You are already verified." };
  if (current.state === "PENDING") return { ok: false, error: "Your documents are already being reviewed." };
  if (current.state === "SUSPENDED") return { ok: false, error: "Your verification is suspended. Contact our team." };

  const parsed = submitSchema.safeParse({
    registrationNumber: formData.get("registrationNumber"),
    certificateExpiry: formData.get("certificateExpiry"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };
  if (parsed.data.certificateExpiry.getTime() <= Date.now()) {
    return { ok: false, error: "That practising certificate has already expired." };
  }

  const licence = checkUpload(formData.get("licence"), "licence");
  if ("error" in licence) return { ok: false, error: licence.error };
  const certificate = checkUpload(formData.get("certificate"), "practising certificate");
  if ("error" in certificate) return { ok: false, error: certificate.error };

  const supabase = await createClient();
  const stamp = Date.now();
  const uploads: { type: DocumentType; path: string; file: File; expiresOn?: Date }[] = [
    { type: "LICENCE", path: `${profile.id}/pharmacist-licence-${stamp}.${fileExtension(licence.file)}`, file: licence.file },
    {
      type: "PRACTISING_CERTIFICATE",
      path: `${profile.id}/pharmacist-certificate-${stamp}.${fileExtension(certificate.file)}`,
      file: certificate.file,
      expiresOn: parsed.data.certificateExpiry,
    },
  ];
  for (const u of uploads) {
    const { error } = await supabase.storage.from(DOCUMENT_BUCKET).upload(u.path, u.file, { contentType: u.file.type, upsert: false });
    if (error) return { ok: false, error: "Upload failed. Please try again." };
  }

  await prisma.pharmacistProfile.upsert({
    where: { profileId: profile.id },
    create: {
      profileId: profile.id,
      registrationNumber: parsed.data.registrationNumber,
      status: "PENDING",
      documents: { create: uploads.map((u) => ({ type: u.type, filePath: u.path, expiresOn: u.expiresOn })) },
    },
    update: {
      registrationNumber: parsed.data.registrationNumber,
      status: "PENDING",
      verifiedAt: null,
      documents: { create: uploads.map((u) => ({ type: u.type, filePath: u.path, expiresOn: u.expiresOn })) },
    },
  });

  revalidatePath("/dashboard/verification");
  revalidatePath("/dashboard/admin/pharmacists");
  return { ok: true, message: "Documents sent for review" };
}

const reviewSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["VERIFIED", "REJECTED"]),
  note: z.string().trim().max(300).optional(),
});

/** Admin decision on a pharmacist's documents. */
export async function reviewPharmacist(input: z.input<typeof reviewSchema>): Promise<Result> {
  const { id, decision, note } = reviewSchema.parse(input);
  const admin = await requireAdmin("/dashboard/admin/pharmacists");

  if (decision === "REJECTED" && !note) return { ok: false, error: "Give the pharmacist a reason." };

  const record = await prisma.pharmacistProfile.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!record) return { ok: false, error: "Pharmacist not found." };
  if (record.status !== "PENDING") return { ok: false, error: "That application was already reviewed." };

  const now = new Date();
  await prisma.$transaction([
    prisma.pharmacistProfile.update({
      where: { id },
      data: { status: decision, verifiedAt: decision === "VERIFIED" ? now : null },
    }),
    prisma.verificationDocument.updateMany({
      where: { pharmacistProfileId: id, status: "PENDING" },
      data: { status: decision, note: note || null, reviewerId: admin.id, reviewedAt: now },
    }),
  ]);

  revalidatePath("/dashboard/admin/pharmacists");
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: decision === "VERIFIED" ? "Pharmacist verified" : "Application rejected" };
}
