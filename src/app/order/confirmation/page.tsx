"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { CheckIcon } from "@/components/icons";

export default function ConfirmationPage() {
  const { orders } = useStore();
  const last = orders[0];

  return (
    <div className="container" style={{ maxWidth: 560, paddingTop: 96, paddingBottom: 96, textAlign: "center" }}>
      <div className="status-icon" style={{ width: 64, height: 64, borderRadius: 999, background: "var(--green-tint)", color: "var(--green-dark)", margin: "0 auto 24px auto" }}>
        <CheckIcon size={28} />
      </div>
      <h1 style={{ fontSize: 28, margin: "0 0 12px 0" }}>Order placed</h1>
      {last && (
        <p style={{ fontSize: 15, color: "rgba(22,50,61,0.6)", margin: "0 0 8px 0" }}>
          Order {last.id} &middot; {last.method}
        </p>
      )}
      <p style={{ fontSize: 15, color: "rgba(22,50,61,0.6)", margin: "0 0 32px 0" }}>We will notify you as soon as it is on the way.</p>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/track" className="btn btn-primary" style={{ padding: "14px 26px" }}>
          Track order
        </Link>
        <Link href="/shop" className="btn btn-soft" style={{ padding: "14px 26px" }}>
          Back to shop
        </Link>
      </div>
    </div>
  );
}
