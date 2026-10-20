"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";

export async function setPreferredPharmacy(input: { pharmacyId: string }) {
  const { pharmacyId } = z.object({ pharmacyId: z.string().min(1) }).parse(input);
  const profile = await requireProfile("/pharmacies");

  const pharmacy = await prisma.pharmacy.findFirst({ where: { id: pharmacyId, status: "ACTIVE" } });
  if (!pharmacy) return { ok: false as const, error: "That pharmacy is no longer listed." };

  await prisma.profile.update({
    where: { id: profile.id },
    data: { preferredPharmacyId: pharmacyId },
  });

  revalidatePath("/pharmacies");
  revalidatePath("/checkout");
  return { ok: true as const, message: `${pharmacy.name} saved for pickup` };
}
