"use client";

import Link from "next/link";
import { useAddToCart } from "./useAddToCart";

export function AddToCartButton({
  productId,
  pharmacyId,
  rx,
  inStock,
  rxApproved = false,
  qty = 1,
  compact = false,
  large = false,
}: {
  productId: number;
  pharmacyId: string;
  rx: boolean;
  inStock: boolean;
  rxApproved?: boolean;
  qty?: number;
  compact?: boolean;
  large?: boolean;
}) {
  const { add, pending, needsSwitch } = useAddToCart(productId, pharmacyId);

  const size = compact ? "!px-4 !py-2 !text-[13.5px]" : large ? "btn-lg" : "";

  if (!inStock) {
    return (
      <button type="button" className={`btn btn-secondary ${size}`} disabled>
        Out of stock
      </button>
    );
  }

  // An Rx item needs a pharmacist-approved prescription first; route there instead.
  if (rx && !rxApproved) {
    return (
      <Link href={`/prescription/${productId}`} className={`btn btn-secondary ${size}`}>
        {compact ? "Upload Rx" : "Upload prescription"}
      </Link>
    );
  }

  return (
    <button type="button" className={`btn btn-primary ${size}`} disabled={pending} onClick={() => add(qty)}>
      {pending ? "Adding…" : needsSwitch ? "Clear cart and add" : compact ? "Add" : "Add to cart"}
    </button>
  );
}
