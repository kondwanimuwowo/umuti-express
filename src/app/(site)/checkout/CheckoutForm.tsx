"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { placeOrder } from "@/lib/actions/orders";
import { fmtK } from "@/lib/format";
import { OrderSummary } from "@/components/OrderSummary";
import { useToast } from "@/components/Toast";
import { StoreIcon, TruckIcon } from "@/components/icons";

type Item = { productId: number; name: string; qty: number; priceNgwee: number };
type PharmacyInfo = { name: string; area: string; hours: string; offersDelivery: boolean; deliveryNote: string | null };

export function CheckoutForm({
  items,
  subtotalNgwee,
  pharmacy,
  needsPrescription,
  defaultPhone,
  defaultAddress,
}: {
  items: Item[];
  subtotalNgwee: number;
  pharmacy: PharmacyInfo;
  needsPrescription: boolean;
  defaultPhone: string;
  defaultAddress: string;
}) {
  const [fulfilment, setFulfilment] = useState<"DELIVERY" | "PICKUP">(pharmacy.offersDelivery ? "DELIVERY" : "PICKUP");
  const [paymentMethod, setPaymentMethod] = useState<"MTN" | "AIRTEL">("MTN");
  const [phone, setPhone] = useState(defaultPhone);
  const [address, setAddress] = useState(defaultAddress);
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const submit = () =>
    startTransition(async () => {
      const data = new FormData();
      data.set("fulfilment", fulfilment);
      data.set("paymentMethod", paymentMethod);
      data.set("phone", phone);
      data.set("address", address);
      if (consent) data.set("consent", "on");
      if (file) data.set("prescription", file);

      // On success this redirects, so only a failure returns here.
      const res = await placeOrder(data);
      if (res && !res.ok) toast(res.error, "error");
    });

  const ready = consent && (!needsPrescription || file !== null);

  return (
    <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-7">
        {needsPrescription && (
          <section className="rounded-card bg-white p-7 shadow-card">
            <h2 className="font-display text-[16px] font-bold">Your prescription</h2>
            <p className="mt-1 mb-5 text-[13.5px] text-ink-55">
              Some items in your cart need a prescription. {pharmacy.name} checks it first, and you pay only after it is
              approved.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              aria-label="Prescription photo or PDF"
              className="block w-full rounded-inner bg-surface px-4 py-3 text-[14px] text-ink file:mr-4 file:rounded-full file:border-0 file:bg-green-tint file:px-4 file:py-2 file:text-[13px] file:font-bold file:text-green-dark"
            />
            <p className="mt-2 text-[12.5px] text-ink-50">A clear photo or PDF, up to 8MB. Only the pharmacy handling this order can open it.</p>
          </section>
        )}

        <section className="rounded-card bg-white p-7 shadow-card">
          <h2 className="font-display text-[16px] font-bold">Pickup or delivery</h2>
          <p className="mt-1 mb-5 text-[13.5px] text-ink-55">
            {pharmacy.name}, {pharmacy.area} &middot; {pharmacy.hours}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {pharmacy.offersDelivery && (
              <OptionButton
                selected={fulfilment === "DELIVERY"}
                onClick={() => setFulfilment("DELIVERY")}
                icon={<TruckIcon />}
                title="Delivery"
                sub={pharmacy.deliveryNote ?? "Arranged with the pharmacy, paid on arrival"}
              />
            )}
            <OptionButton
              selected={fulfilment === "PICKUP"}
              onClick={() => setFulfilment("PICKUP")}
              icon={<StoreIcon />}
              title="Pickup"
              sub="Collect from the pharmacy"
            />
          </div>

          {fulfilment === "DELIVERY" && (
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Delivery address, e.g. Plot 14, Kabulonga Road"
              aria-label="Delivery address"
              className="mt-5 min-h-[76px] w-full resize-y rounded-inner bg-surface px-4 py-3 text-[14.5px] text-ink outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green"
            />
          )}
        </section>

        <section className="rounded-card bg-white p-7 shadow-card">
          <h2 className="mb-5 font-display text-[16px] font-bold">Payment</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <OptionButton
              selected={paymentMethod === "MTN"}
              onClick={() => setPaymentMethod("MTN")}
              title="MTN Mobile Money"
              sub="Pay from your MTN wallet"
            />
            <OptionButton
              selected={paymentMethod === "AIRTEL"}
              onClick={() => setPaymentMethod("AIRTEL")}
              title="Airtel Money"
              sub="Pay from your Airtel wallet"
            />
          </div>

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile money number, e.g. 0977123456"
            aria-label="Mobile money number"
            className="mt-5 w-full rounded-inner bg-surface px-4 py-3 text-[14.5px] text-ink outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green"
          />
          <p className="mt-3 text-[12.5px] text-ink-50">
            {needsPrescription
              ? "You will not be charged now. We ask for payment once the pharmacy approves your prescription."
              : "Payments are processed by Lenco by BroadPay."}
          </p>
        </section>

        <label className="flex items-start gap-3 rounded-card bg-white p-5 text-[13.5px] leading-relaxed text-ink-70 shadow-card">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-green)]"
          />
          <span>
            I agree to the{" "}
            <Link href="/legal/terms" target="_blank" className="font-bold text-green-dark">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" target="_blank" className="font-bold text-green-dark">
              Privacy Policy
            </Link>
            , and that Umuti Express shares my name, phone number
            {fulfilment === "DELIVERY" && ", delivery address"}
            {needsPrescription && " and prescription"} with {pharmacy.name}, only to fulfil this order.
          </span>
        </label>
      </div>

      <OrderSummary
        subtotalNgwee={subtotalNgwee}
        note={fulfilment === "DELIVERY" ? "Delivery is arranged with the pharmacy and paid on arrival." : undefined}
        sticky
        lines={items.map((i) => (
          <div key={i.productId} className="flex justify-between gap-3 text-[13.5px] text-ink-70">
            <span>
              {i.qty} &times; {i.name}
            </span>
            <span>{fmtK(i.priceNgwee * i.qty)}</span>
          </div>
        ))}
      >
        <button type="button" className="btn btn-primary btn-lg w-full" disabled={pending || !ready} onClick={submit}>
          {pending ? "Processing…" : needsPrescription ? "Send for review" : "Place order"}
        </button>
      </OrderSummary>
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  icon,
  title,
  sub,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  title: string;
  sub: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative rounded-inner p-4 text-left transition-colors ${
        selected ? "bg-green-tint ring-2 ring-green" : "bg-surface hover:bg-green-tint/60"
      }`}
    >
      {badge && (
        <span className="absolute top-3 right-3 rounded-full bg-green px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-white uppercase">
          {badge}
        </span>
      )}
      {icon && <span className="mb-2 block text-green-dark">{icon}</span>}
      <span className="block text-[14.5px] font-bold">{title}</span>
      <span className="mt-0.5 block text-[12.5px] text-ink-55">{sub}</span>
    </button>
  );
}
