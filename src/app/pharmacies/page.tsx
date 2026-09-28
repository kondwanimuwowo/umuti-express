"use client";

import { useMemo, useState } from "react";
import { PHARMACIES } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ImageSlot } from "@/components/ImageSlot";
import { PharmacyMap } from "@/components/PharmacyMap";

const AREAS = Array.from(new Set(PHARMACIES.map((p) => p.area)));

export default function PharmaciesPage() {
  const { selectedPharmacyId, selectPharmacy } = useStore();
  const [area, setArea] = useState<string | null>(null);
  const list = useMemo(() => PHARMACIES.filter((p) => !area || p.area === area), [area]);

  return (
    <div className="container page">
      <h1 className="page-title">Pharmacies near you</h1>
      <div className="chips" style={{ marginBottom: 32 }}>
        {[null, ...AREAS].map((a) => (
          <button key={a ?? "all"} className="chip" aria-pressed={area === a} onClick={() => setArea((cur) => (cur === a ? null : a))}>
            {a ?? "All areas"}
          </button>
        ))}
      </div>
      <PharmacyMap pharmacies={list} selectedId={selectedPharmacyId} onSelect={selectPharmacy} />
      <div className="pharm-grid">
        {list.map((ph) => {
          const selected = ph.id === selectedPharmacyId;
          return (
            <div key={ph.id} className="card list-card">
              <ImageSlot id={`pharm-${ph.id}`} placeholder="Storefront photo" style={{ width: 96, height: 96, borderRadius: 14, flexShrink: 0 }} />
              <div className="list-card-body">
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{ph.name}</div>
                <div style={{ fontSize: 13, color: "var(--ink-55)", marginBottom: 6 }}>
                  {ph.area} &middot; {ph.distance}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--green-dark)" }}>{ph.hours}</div>
              </div>
              <button
                className={`btn ${selected ? "btn-selected" : "btn-soft"}`}
                style={{ padding: "11px 20px", fontSize: 13.5, flexShrink: 0 }}
                onClick={() => selectPharmacy(ph.id)}
                aria-pressed={selected}
              >
                {selected ? "Selected" : "Select for pickup"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
