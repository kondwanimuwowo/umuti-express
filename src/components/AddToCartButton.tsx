"use client";

import { useAddToCart } from "./useAddToCart";

export function AddToCartButton({
  productId,
  pharmacyId,
  inStock,
  qty = 1,
  compact = false,
  large = false,
}: {
  productId: number;
  pharmacyId: string;
  inStock: boolean;
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

  return (
    <button type="button" className={`btn btn-primary ${size}`} disabled={pending} onClick={() => add(qty)}>
      {pending ? "Adding…" : needsSwitch ? "Clear cart and add" : compact ? "Add" : "Add to cart"}
    </button>
  );
}
