import type { ProductClassification } from "@/generated/prisma";

export const CLASSIFICATION_LABEL: Record<ProductClassification, string> = {
  GENERAL: "General sale",
  PHARMACY_ONLY: "Pharmacy only",
  PRESCRIPTION: "Prescription only",
};

export const CLASSIFICATIONS = Object.keys(CLASSIFICATION_LABEL) as ProductClassification[];

/** Longest price a listing may carry, in ngwee (K100,000). Catches a mistyped extra zero. */
export const MAX_PRICE_NGWEE = 10_000_000;
export const MAX_STOCK = 100_000;

/** A neutral one-line description built from the product's facts, for pharmacy-added products. */
export function describeProduct(p: {
  name: string;
  genericName?: string | null;
  strength?: string | null;
  form?: string | null;
  packSize?: string | null;
}) {
  const what = [p.genericName ?? p.name, p.strength, p.form?.toLowerCase()].filter(Boolean).join(" ");
  return p.packSize ? `${what}, ${p.packSize}.` : `${what}.`;
}
