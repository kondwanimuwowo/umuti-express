"use client";

import Link from "next/link";
import { findProduct, fmtK } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ImageSlot } from "@/components/ImageSlot";
import { OrderSummary } from "@/components/OrderSummary";

export default function CartPage() {
  const { cart, changeCartQty, removeFromCart } = useStore();

  return (
    <div className="container page">
      <h1 className="page-title">Your cart</h1>
      {cart.length === 0 ? (
        <div style={{ padding: "80px 0", textAlign: "center" }}>
          <div style={{ fontSize: 16, color: "var(--ink-55)", marginBottom: 24 }}>Your cart is empty.</div>
          <Link href="/shop" className="btn btn-primary" style={{ display: "inline-block" }}>
            Browse medicines
          </Link>
        </div>
      ) : (
        <div className="grid-sidebar">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cart.map((c) => {
              const p = findProduct(c.id);
              if (!p) return null;
              return (
                <div key={c.id} className="card list-card">
                  <ImageSlot id={`product-${p.id}`} placeholder={`Photo: ${p.name}`} style={{ width: 80, height: 80, borderRadius: 14, flexShrink: 0 }} />
                  <div className="list-card-body">
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-50)" }}>{fmtK(p.price)} each</div>
                  </div>
                  <div className="qty qty-sm">
                    <button onClick={() => changeCartQty(c.id, -1)} aria-label="Decrease quantity">
                      -
                    </button>
                    <span>{c.qty}</span>
                    <button onClick={() => changeCartQty(c.id, 1)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "var(--green-dark)", minWidth: 80, textAlign: "right" }}>{fmtK(p.price * c.qty)}</div>
                  <button
                    onClick={() => removeFromCart(c.id)}
                    style={{ background: "transparent", border: "none", color: "var(--ink-40)", fontSize: 13, fontWeight: 700 }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          <OrderSummary>
            <Link href="/checkout" className="btn btn-primary btn-lg btn-block" style={{ display: "block", textAlign: "center", padding: "15px 0" }}>
              Go to checkout
            </Link>
          </OrderSummary>
        </div>
      )}
    </div>
  );
}
