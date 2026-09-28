"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DELIVERY_FEE, PHARMACIES, findProduct, fmtK } from "@/lib/data";
import { useStore } from "@/lib/store";
import { OrderSummary } from "@/components/OrderSummary";
import { CheckIcon, StoreIcon, TruckIcon } from "@/components/icons";

export default function CheckoutPage() {
  const router = useRouter();
  const s = useStore();

  if (s.cart.length === 0) {
    return (
      <div className="container page" style={{ textAlign: "center" }}>
        <h1 className="page-title">Checkout</h1>
        <div style={{ fontSize: 16, color: "var(--ink-55)", marginBottom: 24 }}>Your cart is empty.</div>
        <Link href="/shop" className="btn btn-primary" style={{ display: "inline-block" }}>
          Browse medicines
        </Link>
      </div>
    );
  }

  const place = () => {
    const order = s.placeOrder();
    router.push(`/order/confirmation?id=${encodeURIComponent(order.id)}`);
  };

  return (
    <div className="container page">
      <h1 className="page-title">Checkout</h1>
      <div className="grid-sidebar">
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>How should we get this to you?</div>
            <div className="option-grid">
              <button className="option" aria-pressed={s.deliveryMethod === "delivery"} onClick={() => s.set({ deliveryMethod: "delivery" })}>
                <span className="recommended">Recommended</span>
                <TruckIcon />
                <div className="option-title">Home delivery</div>
                <div className="option-sub">{fmtK(DELIVERY_FEE)} &middot; same day in Lusaka</div>
              </button>
              <button className="option" aria-pressed={s.deliveryMethod === "pickup"} onClick={() => s.set({ deliveryMethod: "pickup" })}>
                <StoreIcon />
                <div className="option-title">Pickup from pharmacy</div>
                <div className="option-sub">Free &middot; ready in 2 hours</div>
              </button>
            </div>
            {s.deliveryMethod === "delivery" ? (
              <textarea
                className="field"
                value={s.address}
                onChange={(e) => s.set({ address: e.target.value })}
                placeholder="Delivery address, e.g. Plot 14, Kabulonga Road"
                aria-label="Delivery address"
                style={{ minHeight: 70, resize: "vertical" }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PHARMACIES.slice(0, 3).map((ph) => {
                  const selected = s.selectedPharmacyId === ph.id;
                  return (
                    <button
                      key={ph.id}
                      className="row-item"
                      onClick={() => s.selectPharmacy(ph.id)}
                      aria-pressed={selected}
                      style={{ border: "none", textAlign: "left", background: selected ? "var(--green-tint)" : "var(--surface)" }}
                    >
                      <div>
                        <div className="row-title">{ph.name}</div>
                        <div className="row-sub">
                          {ph.area} &middot; {ph.distance}
                        </div>
                      </div>
                      {selected && (
                        <span style={{ color: "var(--green-dark)" }}>
                          <CheckIcon />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Payment</div>
            <div className="option-grid">
              <button className="option" aria-pressed={s.paymentMethod === "mtn"} onClick={() => s.set({ paymentMethod: "mtn" })}>
                <div className="option-title">MTN Mobile Money</div>
                <div className="option-sub">Pay from your MTN wallet</div>
              </button>
              <button className="option" aria-pressed={s.paymentMethod === "airtel"} onClick={() => s.set({ paymentMethod: "airtel" })}>
                <div className="option-title">Airtel Money</div>
                <div className="option-sub">Pay from your Airtel wallet</div>
              </button>
            </div>
            <input
              className="field"
              type="tel"
              value={s.phoneNumber}
              onChange={(e) => s.set({ phoneNumber: e.target.value })}
              placeholder="Mobile money number, e.g. 097 123 4567"
              aria-label="Mobile money number"
              style={{ marginBottom: 14 }}
            />
            <div style={{ fontSize: 12.5, color: "var(--ink-50)" }}>Payments are processed securely via Lenco by BroadPay.</div>
          </div>
        </div>

        <OrderSummary
          sticky
          lines={
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {s.cart.map((c) => {
                const p = findProduct(c.id);
                if (!p) return null;
                return (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5, color: "var(--ink-70)" }}>
                    <span>
                      {c.qty} &times; {p.name}
                    </span>
                    <span>{fmtK(p.price * c.qty)}</span>
                  </div>
                );
              })}
            </div>
          }
        >
          <button className="btn btn-primary btn-lg btn-block" style={{ padding: "15px 0" }} onClick={place}>
            Place order
          </button>
        </OrderSummary>
      </div>
    </div>
  );
}
