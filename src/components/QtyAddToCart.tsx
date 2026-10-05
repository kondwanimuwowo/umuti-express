"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/actions/cart";
import { useToast } from "./Toast";

export function QtyAddToCart({
  productId,
  rx,
  rxApproved,
  inStock,
}: {
  productId: number;
  rx: boolean;
  rxApproved: boolean;
  inStock: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  if (!inStock) {
    return (
      <button type="button" className="btn btn-secondary btn-lg" disabled>
        Out of stock
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-nav">
        <button
          type="button"
          onClick={() => setQty((n) => Math.max(1, n - 1))}
          aria-label="Decrease quantity"
          className="h-9 w-9 rounded-full text-[18px] font-bold text-ink-70 hover:bg-surface"
        >
          &minus;
        </button>
        <span className="min-w-8 text-center text-[15px] font-bold" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((n) => Math.min(99, n + 1))}
          aria-label="Increase quantity"
          className="h-9 w-9 rounded-full text-[18px] font-bold text-ink-70 hover:bg-surface"
        >
          +
        </button>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-lg"
        disabled={pending || (rx && !rxApproved)}
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
        {pending ? "Adding…" : "Add to cart"}
      </button>
    </div>
  );
}
