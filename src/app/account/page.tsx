"use client";

import { useRouter } from "next/navigation";
import { findProduct, fmtK } from "@/lib/data";
import { useStore } from "@/lib/store";
import { UserIcon } from "@/components/icons";

export default function AccountPage() {
  const router = useRouter();
  const { orders, reorder } = useStore();

  return (
    <div className="container" style={{ maxWidth: 900, paddingTop: 48, paddingBottom: 96 }}>
      <h1 className="page-title">Your account</h1>
      <div className="panel" style={{ padding: "24px 28px", display: "flex", alignItems: "center", gap: 18, marginBottom: 36 }}>
        <div className="status-icon" style={{ width: 52, height: 52, borderRadius: 999, background: "var(--navy)", color: "#fff" }}>
          <UserIcon size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Mutale Banda</div>
          <div style={{ fontSize: 13.5, color: "var(--ink-55)" }}>097 712 3456 &middot; Kabulonga, Lusaka</div>
        </div>
      </div>
      <h2 style={{ fontFamily: "var(--font-body)", fontSize: 18, margin: "0 0 18px 0" }}>Order history</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orders.map((o) => {
          const delivered = o.status === "Delivered";
          return (
            <div key={o.id} className="card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Order {o.id}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-50)" }}>
                    {o.date} &middot; {o.method}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "6px 14px",
                    borderRadius: 999,
                    flexShrink: 0,
                    background: delivered ? "var(--green-tint)" : "var(--amber-tint)",
                    color: delivered ? "var(--green-dark)" : "var(--amber)",
                  }}
                >
                  {o.status}
                </span>
              </div>
              <div style={{ fontSize: 13.5, color: "rgba(22,50,61,0.6)", marginBottom: 16 }}>
                {o.items.map((it) => `${it.qty} × ${findProduct(it.id)?.name ?? ""}`).join(", ")}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: "var(--green-dark)" }}>{fmtK(o.total)}</span>
                <button
                  className="btn btn-soft"
                  style={{ padding: "10px 20px", fontSize: 13 }}
                  onClick={() => {
                    reorder(o);
                    router.push("/cart");
                  }}
                >
                  Reorder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
