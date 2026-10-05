import type { ReactNode } from "react";
import { fmtK } from "@/lib/format";

export function OrderSummary({
  subtotalNgwee,
  deliveryNgwee,
  lines,
  children,
  sticky = false,
}: {
  subtotalNgwee: number;
  deliveryNgwee: number;
  lines?: ReactNode;
  children?: ReactNode;
  sticky?: boolean;
}) {
  return (
    <div className={`rounded-card bg-white p-6 shadow-card ${sticky ? "lg:sticky lg:top-[88px]" : ""}`}>
      <h2 className="font-display text-[17px] font-bold">Order summary</h2>

      {lines && <div className="mt-4 flex flex-col gap-2.5">{lines}</div>}

      <dl className="mt-4 flex flex-col gap-2.5 border-t border-black/[0.08] pt-4 text-[14px]">
        <div className="flex justify-between">
          <dt className="text-ink-62">Subtotal</dt>
          <dd className="font-semibold">{fmtK(subtotalNgwee)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-62">Delivery</dt>
          <dd className="font-semibold">{deliveryNgwee === 0 ? "Free" : fmtK(deliveryNgwee)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-black/[0.08] pt-4">
        <span className="font-display text-[15.5px] font-bold">Total</span>
        <span className="font-display text-[20px] font-bold text-green-dark">{fmtK(subtotalNgwee + deliveryNgwee)}</span>
      </div>

      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
