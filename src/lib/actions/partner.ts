"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { requireOwner } from "@/lib/staff";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_BUCKET } from "@/lib/storage";
import { hasAcceptedCurrent, recordAcceptance } from "@/lib/legal";
import type { DocumentType } from "@/generated/prisma";

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const INVITE_DAYS = 7;

/** Centre of Lusaka. A new pharmacy starts here until admin sets its real location on approval. */
const LUSAKA = { lat: -15.4167, lng: 28.2833 };

const pharmacyFields = z.object({
  name: z.string().trim().min(2, "Enter the pharmacy name.").max(80),
  area: z.string().trim().min(2, "Enter the area, e.g. Kabulonga.").max(60),
  address: z.string().trim().min(5, "Enter the street address.").max(200),
  phone: z.string().trim().min(7, "Enter a contact number.").max(20),
  hours: z.string().trim().min(2, "Enter the opening hours.").max(60),
  offersDelivery: z.boolean(),
  deliveryNote: z.string().trim().max(160).optional(),
});

type Result = { ok: true; message?: string } | { ok: false; error: string };

function extension(file: File) {
  return file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
}

function validateDocument(file: unknown, label: string): { file: File } | { error: string } {
  if (!(file instanceof File) || file.size === 0) return { error: `Upload the ${label}.` };
  if (file.size > MAX_BYTES) return { error: `The ${label} is larger than 8MB.` };
  if (!ACCEPTED.includes(file.type)) return { error: `The ${label} must be a JPEG, PNG, WebP or PDF.` };
  return { file };
}

/**
 * A signed-in user applies to list a pharmacy. It stays PENDING, and hidden, until an admin
 * has checked the documents. The applicant becomes its owner but gets no staff access yet.
 */
export async function applyAsPharmacy(formData: FormData): Promise<Result> {
  const profile = await requireProfile("/partner/apply");
  if (profile.pharmacyId) return { ok: false, error: "Your account is already linked to a pharmacy." };
  if (formData.get("acceptAgreement") !== "on") {
    return { ok: false, error: "Accept the Pharmacy Partner Agreement on behalf of the pharmacy to apply." };
  }

  const parsed = pharmacyFields.safeParse({
    name: formData.get("name"),
    area: formData.get("area"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    hours: formData.get("hours"),
    offersDelivery: formData.get("offersDelivery") === "on",
    deliveryNote: formData.get("deliveryNote") || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };

  const registration = validateDocument(formData.get("registration"), "pharmacy registration certificate");
  if ("error" in registration) return { ok: false, error: registration.error };
  const licence = validateDocument(formData.get("licence"), "business licence");
  if ("error" in licence) return { ok: false, error: licence.error };

  const supabase = await createClient();
  const stamp = Date.now();
  const uploads: { type: DocumentType; path: string; file: File }[] = [
    { type: "PHARMACY_REGISTRATION", path: `${profile.id}/registration-${stamp}.${extension(registration.file)}`, file: registration.file },
    { type: "BUSINESS_LICENCE", path: `${profile.id}/licence-${stamp}.${extension(licence.file)}`, file: licence.file },
  ];
  for (const u of uploads) {
    const { error } = await supabase.storage.from(DOCUMENT_BUCKET).upload(u.path, u.file, {
      contentType: u.file.type,
      upsert: false,
    });
    if (error) return { ok: false, error: "Upload failed. Please try again." };
  }

  const id = `ph_${randomBytes(6).toString("hex")}`;
  const { offersDelivery, deliveryNote, ...details } = parsed.data;

  await prisma.$transaction([
    prisma.pharmacy.create({
      data: {
        id,
        ...details,
        ...LUSAKA,
        offersDelivery,
        deliveryNote: offersDelivery ? (deliveryNote ?? null) : null,
        status: "PENDING",
        documents: {
          create: uploads.map((u) => ({ type: u.type, filePath: u.path })),
        },
      },
    }),
    prisma.profile.update({ where: { id: profile.id }, data: { pharmacyId: id, isPharmacyOwner: true } }),
  ]);

  await recordAcceptance({ profileId: profile.id, types: ["PARTNER"], pharmacyId: id });

  revalidatePath("/dashboard");
  return { ok: true, message: "Application sent. We will review your documents." };
}

const settingsSchema = pharmacyFields;

export async function updatePharmacy(input: z.input<typeof settingsSchema>): Promise<Result> {
  const { pharmacy } = await requireOwner("/dashboard/settings");
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };

  const { offersDelivery, deliveryNote, ...details } = parsed.data;
  await prisma.pharmacy.update({
    where: { id: pharmacy.id },
    data: { ...details, offersDelivery, deliveryNote: offersDelivery ? (deliveryNote ?? null) : null },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/pharmacies");
  return { ok: true, message: "Pharmacy details saved" };
}

/** Creates a single-use join link. Returns the token; the page builds the full URL. */
export async function createInvite(input: { label?: string }): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const { label } = z.object({ label: z.string().trim().max(60).optional() }).parse(input);
  const { pharmacy } = await requireOwner("/dashboard/settings");

  const token = randomBytes(24).toString("base64url");
  await prisma.pharmacyInvite.create({
    data: {
      token,
      label: label || null,
      pharmacyId: pharmacy.id,
      expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  revalidatePath("/dashboard/settings");
  return { ok: true, token };
}

export async function revokeInvite(input: { id: string }): Promise<Result> {
  const { id } = z.object({ id: z.string().min(1) }).parse(input);
  const { pharmacy } = await requireOwner("/dashboard/settings");

  await prisma.pharmacyInvite.deleteMany({ where: { id, pharmacyId: pharmacy.id, usedAt: null } });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function removeStaff(input: { profileId: string }): Promise<Result> {
  const { profileId } = z.object({ profileId: z.string().uuid() }).parse(input);
  const { profile, pharmacy } = await requireOwner("/dashboard/settings");

  if (profileId === profile.id) return { ok: false, error: "You can't remove yourself." };

  const member = await prisma.profile.findFirst({ where: { id: profileId, pharmacyId: pharmacy.id } });
  if (!member) return { ok: false, error: "That person is not on your team." };
  if (member.isPharmacyOwner) return { ok: false, error: "You can't remove an owner." };

  await prisma.profile.update({ where: { id: member.id }, data: { pharmacyId: null, role: "CUSTOMER" } });

  revalidatePath("/dashboard/settings");
  return { ok: true, message: "Removed from the team" };
}

/** Redeems an invite link for the signed-in user. */
export async function joinPharmacy(input: { token: string }): Promise<Result> {
  const { token } = z.object({ token: z.string().min(10).max(100) }).parse(input);
  const profile = await requireProfile(`/join/${token}`);

  if (profile.pharmacyId) return { ok: false, error: "Your account is already linked to a pharmacy." };
  if (profile.role === "ADMIN") return { ok: false, error: "Admin accounts can't join a pharmacy." };

  const invite = await prisma.pharmacyInvite.findUnique({
    where: { token },
    include: { pharmacy: true },
  });
  if (!invite || invite.usedAt || invite.expiresAt < new Date() || invite.pharmacy.status !== "ACTIVE") {
    return { ok: false, error: "This invite is no longer valid. Ask the owner for a new one." };
  }

  // The conditional update makes a link single-use even if two people open it at once.
  const claimed = await prisma.pharmacyInvite.updateMany({
    where: { id: invite.id, usedAt: null },
    data: { usedAt: new Date(), usedById: profile.id },
  });
  if (claimed.count === 0) return { ok: false, error: "This invite has already been used." };

  await prisma.profile.update({
    where: { id: profile.id },
    data: { pharmacyId: invite.pharmacyId, role: "PHARMACIST", isPharmacyOwner: false },
  });

  revalidatePath("/dashboard");
  return { ok: true, message: `You joined ${invite.pharmacy.name}` };
}

/** The owner accepts the current version of the partner agreement, for a pharmacy that has not yet accepted it. */
export async function acceptPartnerAgreement(): Promise<Result> {
  const { profile, pharmacy } = await requireOwner("/dashboard/agreement");
  if (await hasAcceptedCurrent(profile.id, "PARTNER")) return { ok: true, message: "Already accepted" };

  await recordAcceptance({ profileId: profile.id, types: ["PARTNER"], pharmacyId: pharmacy.id });

  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Agreement accepted" };
}
