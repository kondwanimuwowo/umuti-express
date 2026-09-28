"use client";

import Link from "next/link";
import { useState } from "react";
import { PHARMACIES, catName, fmtK, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ImageSlot } from "@/components/ImageSlot";
import { ChevronLeft } from "@/components/icons";

export function ProductView({ product: p }: { product: Product }) {
  const { addToCart, approvedRx, cart } = useStore();
  const [qty, setQty] = useState(1);
  const canAdd = !p.rx || approvedRx.includes(p.id) || cart.some((c) => c.id === p.id);

  return (
    <div className="container page">
      <Link href="/shop" className="back-link">
        <ChevronLeft />
        Back to shop
      </Link>
      <div className="grid-2">
        <ImageSlot id={`product-${p.id}`} placeholder={`Photo: ${p.name}`} className="detail-photo" eager />
        <div>
          <div style={{ fontSize: 13, color: "var(--ink-50)", fontWeight: 700, marginBottom: 10 }}>{catName(p.category)}</div>
          <h1 style={{ fontSize: 30, margin: "0 0 14px 0" }}>{p.name}</h1>
          <div style={{ fontWeight: 800, fontSize: 26, color: "var(--green-dark)", marginBottom: 18 }}>{fmtK(p.price)}</div>
          {p.rx && (
            <div className="badge-rx" style={{ fontSize: 12.5, padding: "7px 14px", marginBottom: 20 }}>
              Prescription required
            </div>
          )}
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink-70)", margin: "0 0 28px 0" }}>{p.blurb}</p>

          {canAdd ? (
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
              <div className="qty">
                <button onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Decrease quantity">
                  -
                </button>
                <span>{qty}</span>
                <button onClick={() => setQty((n) => n + 1)} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => addToCart(p.id, qty)}>
                Add to cart
              </button>
            </div>
          ) : (
            <Link href={`/prescription/${p.id}`} className="btn btn-navy btn-lg" style={{ display: "inline-block" }}>
              Upload prescription to order
            </Link>
          )}

          <div style={{ marginTop: 40, paddingTop: 32, boxShadow: "var(--divider)" }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Available at nearby pharmacies</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PHARMACIES.slice(0, 3).map((ph) => (
                <div key={ph.id} className="row-item">
                  <div style={{ minWidth: 0 }}>
                    <div className="row-title">{ph.name}</div>
                    <div className="row-sub">
                      {ph.area} &middot; {ph.distance}
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--green-dark)", flexShrink: 0 }}>{ph.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
