"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder, payForOrder } from "@/lib/actions/orders";
import { fmtK } from "@/lib/format";
import { useToast } from "./Toast";

/** What a customer can do with an order that is still waiting: pay once approved, or withdraw it. */
export function OrderActions({ code, canPay, totalNgwee }: { code: string; canPay: boolean; totalNgwee: number }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast(done);
        router.refresh();
      } else {
        toast(res.error ?? "Something went wrong.", "error");
      }
    });

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {canPay && (
        <button type="button" className="btn btn-primary" disabled={pending} onClick={() => run(() => payForOrder({ code }), "Payment received")}>
          {pending ? "Processing…" : `Pay ${fmtK(totalNgwee)}`}
        </button>
      )}
      <button
        type="button"
        className="btn btn-secondary"
        disabled={pending}
        onClick={() => run(() => cancelOrder({ code }), "Order cancelled")}
      >
        Cancel order
      </button>
    </div>
  );
}
