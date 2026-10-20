import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import type { Pharmacy, Profile } from "@/generated/prisma";

export type StaffContext = { profile: Profile; pharmacy: Pharmacy };

/**
 * Staff of a live pharmacy, with that pharmacy. Every dashboard query and action starts here
 * and filters by `pharmacy.id`, which is what keeps one pharmacy out of another's data.
 *
 * Someone whose pharmacy is still pending or suspended is sent to /dashboard, which explains why.
 */
export async function requireStaff(returnTo = "/dashboard"): Promise<StaffContext> {
  const profile = await requireProfile(returnTo);

  if (!profile.pharmacyId) redirect(profile.role === "ADMIN" ? "/dashboard/admin" : "/");

  const pharmacy = await prisma.pharmacy.findUnique({ where: { id: profile.pharmacyId } });
  if (!pharmacy) redirect("/");
  if (pharmacy.status !== "ACTIVE") redirect("/dashboard");
  if (profile.role !== "PHARMACIST" && profile.role !== "ADMIN") redirect("/");

  return { profile, pharmacy };
}

/** Staff who own the pharmacy: they manage its profile and team. */
export async function requireOwner(returnTo = "/dashboard/settings"): Promise<StaffContext> {
  const ctx = await requireStaff(returnTo);
  if (!ctx.profile.isPharmacyOwner) redirect("/dashboard");
  return ctx;
}

/** Platform admin. Not tied to any one pharmacy. */
export async function requireAdmin(returnTo = "/dashboard/admin"): Promise<Profile> {
  const profile = await requireProfile(returnTo);
  if (profile.role !== "ADMIN") redirect("/");
  return profile;
}
