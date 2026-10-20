"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff";
import { searchCatalogue, type CatalogueMatch } from "@/lib/queries";
import { MAX_PRICE_NGWEE, MAX_STOCK, describeProduct } from "@/lib/catalogue";

const listingFields = {
  priceNgwee: z.coerce.number().int().min(1, "Enter a price.").max(MAX_PRICE_NGWEE, "That price looks too high."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative.").max(MAX_STOCK),
};

const text = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined);

const newProductSchema = z.object({
  name: z.string().trim().min(2, "Enter the product name.").max(100),
  genericName: text(100),
  aliases: text(200),
  strength: text(40),
  form: text(40),
  packSize: text(60),
  categorySlug: z.string().min(1, "Choose a category."),
  /** Set after the pharmacy has seen the similar products and still wants to add a new one. */
  confirmSimilar: z.boolean().optional(),
  ...listingFields,
});

export type SimilarProduct = Pick<CatalogueMatch, "id" | "name" | "strength" | "form" | "packSize">;

type Result =
  | { ok: true; message: string }
  | { ok: false; error: string; code?: "SIMILAR"; similar?: SimilarProduct[] };

/** Typeahead behind "Add a product". Staff only; matches the catalogue plus this pharmacy's own pending products. */
export async function searchForListing(q: string): Promise<CatalogueMatch[]> {
  const { pharmacy } = await requireStaff("/dashboard/products");
  if (q.trim().length < 2) return [];
  return searchCatalogue(q, pharmacy.id);
}

/** List a product that is already in the catalogue. */
export async function addListing(input: { productId: number; priceNgwee: number; stock: number }): Promise<Result> {
  const { pharmacy } = await requireStaff("/dashboard/products");
  const parsed = z
    .object({ productId: z.coerce.number().int().positive(), ...listingFields })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the price and stock." };
  const { productId, priceNgwee, stock } = parsed.data;

  const product = await prisma.product.findFirst({
    where: { id: productId, OR: [{ status: "APPROVED" }, { createdByPharmacyId: pharmacy.id, status: "PENDING" }] },
    select: { id: true },
  });
  if (!product) return { ok: false, error: "That product is not in the catalogue." };

  const existing = await prisma.pharmacyProduct.findUnique({
    where: { pharmacyId_productId: { pharmacyId: pharmacy.id, productId } },
    select: { id: true },
  });
  if (existing) return { ok: false, error: "You already list this product." };

  await prisma.pharmacyProduct.create({ data: { pharmacyId: pharmacy.id, productId, priceNgwee, stock } });

  revalidatePath("/dashboard/products");
  revalidatePath("/shop");
  return { ok: true, message: "Product added" };
}

/**
 * Add a product the catalogue does not have. It stays pending, and visible only to this
 * pharmacy, until an admin approves it and sets its classification.
 */
export async function createProduct(input: z.input<typeof newProductSchema>): Promise<Result> {
  const { pharmacy } = await requireStaff("/dashboard/products");
  const parsed = newProductSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the details." };
  const { priceNgwee, stock, confirmSimilar, aliases, categorySlug, ...details } = parsed.data;

  const category = await prisma.category.findUnique({ where: { slug: categorySlug }, select: { slug: true } });
  if (!category) return { ok: false, error: "Choose a category." };

  const visible = Prisma.sql`(p.status = 'APPROVED' OR (p.status = 'PENDING' AND p."createdByPharmacyId" = ${pharmacy.id}))`;

  const exact = await prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
    SELECT p.id FROM "Product" p
    WHERE ${visible}
      AND lower(p.name) = lower(${details.name})
      AND lower(COALESCE(p.strength, '')) = lower(${details.strength ?? ""})
      AND lower(COALESCE(p.form, '')) = lower(${details.form ?? ""})
    LIMIT 1
  `);
  if (exact.length > 0) {
    return { ok: false, error: "That product is already in the catalogue. Search for it and add it instead." };
  }

  if (!confirmSimilar) {
    const similar = await prisma.$queryRaw<SimilarProduct[]>(Prisma.sql`
      SELECT p.id, p.name, p.strength, p.form, p."packSize"
      FROM "Product" p
      WHERE ${visible} AND similarity(p.name, ${details.name}) >= 0.45
      ORDER BY similarity(p.name, ${details.name}) DESC
      LIMIT 5
    `);
    if (similar.length > 0) {
      return { ok: false, code: "SIMILAR", error: "Similar products already exist.", similar };
    }
  }

  await prisma.product.create({
    data: {
      ...details,
      aliases: aliases ? aliases.split(",").map((a) => a.trim()).filter(Boolean).slice(0, 10) : [],
      categorySlug,
      blurb: describeProduct(details),
      status: "PENDING",
      createdByPharmacyId: pharmacy.id,
      pharmacyProducts: { create: { pharmacyId: pharmacy.id, priceNgwee, stock } },
    },
  });

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/admin/catalogue");
  return { ok: true, message: "Product submitted for approval" };
}

/** Price, stock and visibility of one of this pharmacy's own listings. */
export async function updateListing(input: {
  productId: number;
  priceNgwee: number;
  stock: number;
  active: boolean;
}): Promise<Result> {
  const { pharmacy } = await requireStaff("/dashboard/products");
  const parsed = z
    .object({ productId: z.coerce.number().int().positive(), active: z.boolean(), ...listingFields })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the price and stock." };
  const { productId, ...data } = parsed.data;

  const { count } = await prisma.pharmacyProduct.updateMany({ where: { pharmacyId: pharmacy.id, productId }, data });
  if (count === 0) return { ok: false, error: "You do not list that product." };

  revalidatePath("/dashboard/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${productId}`);
  return { ok: true, message: "Saved" };
}
