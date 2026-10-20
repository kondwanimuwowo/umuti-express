import type { ReactNode } from "react";
import { fmtK } from "@/lib/format";

export function OrderSummary({
  subtotalNgwee,
  note,
  lines,
  children,
  sticky = false,
}: {
  subtotalNgwee: number;
  /** Shown under the total, e.g. how delivery is paid. */
  note?: string;
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
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-black/[0.08] pt-4">
        <span className="font-display text-[15.5px] font-bold">Total</span>
        <span className="font-display text-[20px] font-bold text-green-dark">{fmtK(subtotalNgwee)}</span>
      </div>

      {note && <p className="mt-3 text-[12.5px] leading-relaxed text-ink-55">{note}</p>}

      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
