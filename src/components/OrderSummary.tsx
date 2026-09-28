"use client";

import type { ReactNode } from "react";
import { fmtK } from "@/lib/data";
import { useStore } from "@/lib/store";

export function OrderSummary({ children, lines, sticky = false }: { children: ReactNode; lines?: ReactNode; sticky?: boolean }) {
  const { subtotal, deliveryFee } = useStore();
  return (
    <div className={`panel summary ${sticky ? "summary-sticky" : ""}`}>
      <div className="summary-title">Order summary</div>
      {lines}
      <div className="summary-line">
        <span>Subtotal</span>
        <span>{fmtK(subtotal)}</span>
      </div>
      <div className="summary-line">
        <span>Delivery</span>
        <span>{fmtK(deliveryFee)}</span>
      </div>
      <div className="summary-total">
        <span>Total</span>
        <span>{fmtK(subtotal + deliveryFee)}</span>
      </div>
      {children}
    </div>
  );
}
