"use client";

import { useStore } from "@/lib/store";
import { CheckIcon } from "@/components/icons";

const STAGES = {
  delivery: [
    ["Order placed", "We received your order"],
    ["Preparing your order", "Pharmacy is packing your items"],
    ["Out for delivery", "A rider is on the way"],
    ["Delivered", "Order received"],
  ],
  pickup: [
    ["Order placed", "We received your order"],
    ["Preparing your order", "Pharmacy is packing your items"],
    ["Ready for pickup", "Head to the pharmacy counter"],
    ["Picked up", "Order collected"],
  ],
} as const;

export default function TrackPage() {
  const { orders, trackingStage, advanceTracking } = useStore();
  const last = orders[0];
  const stages = STAGES[last?.kind ?? "delivery"];

  return (
    <div className="container" style={{ maxWidth: 760, paddingTop: 48, paddingBottom: 96 }}>
      <h1 className="page-title" style={{ marginBottom: 8 }}>
        Track your order
      </h1>
      {last && (
        <p style={{ fontSize: 14.5, color: "var(--ink-55)", margin: "0 0 36px 0" }}>
          Order {last.id} &middot; {last.method}
        </p>
      )}
      <ol style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0" }}>
        {stages.map(([label, sub], i) => {
          const done = i <= trackingStage;
          return (
            <li key={label} style={{ display: "flex", gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  className="status-icon"
                  style={{ width: 32, height: 32, borderRadius: 999, background: done ? "var(--green)" : "var(--surface)", color: "#fff", transition: "background-color 200ms ease" }}
                >
                  {done && <CheckIcon size={16} />}
                </div>
                {i < stages.length - 1 && (
                  <div style={{ width: 2, flex: 1, minHeight: 36, background: i < trackingStage ? "var(--green)" : "var(--surface)" }} />
                )}
              </div>
              <div style={{ paddingBottom: 36 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: done ? "var(--ink)" : "var(--ink-40)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: "var(--ink-50)" }}>{sub}</div>
              </div>
            </li>
          );
        })}
      </ol>
      {trackingStage < stages.length - 1 && (
        <button className="btn btn-soft" style={{ padding: "13px 24px", fontSize: 14 }} onClick={advanceTracking}>
          Simulate next update
        </button>
      )}
    </div>
  );
}
