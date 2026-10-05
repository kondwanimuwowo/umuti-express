"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeCartQty, removeFromCart } from "@/lib/actions/cart";
import { useToast } from "./Toast";

export function CartRowControls({ productId, qty }: { productId: number; qty: number }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok && res.error) toast(res.error, "error");
      else if (res.message) toast(res.message);
      router.refresh();
    });

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5 rounded-full bg-surface p-1">
        <button
          type="button"
          disabled={pending}
          aria-label="Decrease quantity"
          onClick={() => run(() => changeCartQty({ productId, delta: -1 }))}
          className="h-8 w-8 rounded-full text-[16px] font-bold text-ink-70 hover:bg-white disabled:opacity-50"
        >
          &minus;
        </button>
        <span className="min-w-7 text-center text-[14px] font-bold">{qty}</span>
        <button
          type="button"
          disabled={pending}
          aria-label="Increase quantity"
          onClick={() => run(() => changeCartQty({ productId, delta: 1 }))}
          className="h-8 w-8 rounded-full text-[16px] font-bold text-ink-70 hover:bg-white disabled:opacity-50"
        >
          +
        </button>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => removeFromCart({ productId }))}
        className="text-[13px] font-bold text-ink-40 hover:text-ink disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
