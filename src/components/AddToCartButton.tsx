"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { addToCart } from "@/lib/actions/cart";
import { useToast } from "./Toast";

export function AddToCartButton({
  productId,
  rx,
  inStock,
  rxApproved = false,
  qty = 1,
  compact = false,
  large = false,
}: {
  productId: number;
  rx: boolean;
  inStock: boolean;
  rxApproved?: boolean;
  qty?: number;
  compact?: boolean;
  large?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

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
    <button
      type="button"
      className={`btn btn-primary ${size}`}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await addToCart({ productId, qty });
          if (res.ok) {
            toast(res.message);
            router.refresh();
          } else {
            toast(res.error, "error");
          }
        })
      }
    >
      {pending ? "Adding…" : compact ? "Add" : "Add to cart"}
    </button>
  );
}
