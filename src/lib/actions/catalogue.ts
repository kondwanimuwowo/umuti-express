"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/staff";
import { CLASSIFICATIONS } from "@/lib/catalogue";

const text = (max: number) => z.string().trim().max(max).optional().transform((v) => v || null);

const reviewSchema = z.object({
  id: z.coerce.number().int().positive(),
  decision: z.enum(["APPROVE", "REJECT", "SAVE"]),
  name: z.string().trim().min(2, "Enter the product name.").max(100),
  genericName: text(100),
  aliases: z.string().trim().max(200).optional(),
  strength: text(40),
  form: text(40),
  packSize: text(60),
  blurb: z.string().trim().min(2, "Enter a short description.").max(300),
  categorySlug: z.string().min(1),
  classification: z.enum(CLASSIFICATIONS as [string, ...string[]]),
  note: z.string().trim().max(300).optional(),
});

/**
 * Admin decision on a product. Approving publishes it to customers; rejecting hides it with a reason.
 * Classification is set only here, so a pharmacy cannot list a prescription medicine as general sale.
 */
export async function reviewProduct(input: z.input<typeof reviewSchema>) {
  await requireAdmin("/dashboard/admin/catalogue");
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Check the details." };
  const { id, decision, aliases, note, classification, ...fields } = parsed.data;

  if (decision === "REJECT" && !note) return { ok: false as const, error: "Give the pharmacy a reason." };

  const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!product) return { ok: false as const, error: "Product not found." };
  const category = await prisma.category.findUnique({ where: { slug: fields.categorySlug }, select: { slug: true } });
  if (!category) return { ok: false as const, error: "Choose a category." };

  await prisma.product.update({
    where: { id },
    data: {
      ...fields,
      aliases: aliases ? aliases.split(",").map((a) => a.trim()).filter(Boolean).slice(0, 10) : [],
      classification: classification as (typeof CLASSIFICATIONS)[number],
      ...(decision === "APPROVE" && { status: "APPROVED", reviewNote: null }),
      ...(decision === "REJECT" && { status: "REJECTED", reviewNote: note }),
    },
  });

  revalidatePath("/dashboard/admin/catalogue");
  revalidatePath("/dashboard/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${id}`);
  return {
    ok: true as const,
    message: decision === "APPROVE" ? "Product approved" : decision === "REJECT" ? "Product rejected" : "Saved",
  };
}
