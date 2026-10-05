import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/generated/prisma";

/**
 * The signed-in profile, or null. Cached per request so several server
 * components can call it without repeating the Supabase and database round trips.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  if (existing) return existing;

  // First request after sign-up: mirror the Supabase user into our own tables.
  return prisma.profile.create({
    data: {
      id: user.id,
      email: user.email ?? "",
      fullName: (user.user_metadata.full_name as string | undefined) ?? null,
      phone: (user.user_metadata.phone as string | undefined) ?? null,
    },
  });
});

/** Profile or a redirect to sign-in. Use in any route that needs a user. */
export async function requireProfile(returnTo?: string): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    redirect(returnTo ? `/sign-in?next=${encodeURIComponent(returnTo)}` : "/sign-in");
  }
  return profile;
}

/** Profile with one of the given roles, or a redirect. Guards the review queue. */
export async function requireRole(roles: Role[], returnTo?: string): Promise<Profile> {
  const profile = await requireProfile(returnTo);
  if (!roles.includes(profile.role)) redirect("/");
  return profile;
}

export function isStaff(profile: Profile | null): boolean {
  return profile?.role === "PHARMACIST" || profile?.role === "ADMIN";
}
