"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateListing } from "@/lib/actions/inventory";
import { useToast } from "@/components/Toast";

type Props = {
  productId: number;
  name: string;
  detail: string;
  priceNgwee: number;
  stock: number;
  active: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
};

const STATUS_TAG = {
  PENDING: { label: "Awaiting approval", style: "bg-amber-tint text-amber" },
  REJECTED: { label: "Not approved", style: "bg-[#fbe4e4] text-[#9b2c2c]" },
} as const;

export function ListingRow(p: Props) {
  const [price, setPrice] = useState((p.priceNgwee / 100).toFixed(2));
  const [stock, setStock] = useState(String(p.stock));
  const [active, setActive] = useState(p.active);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const dirty = Math.round(Number(price) * 100) !== p.priceNgwee || Number(stock) !== p.stock || active !== p.active;
  const tag = p.status === "APPROVED" ? null : STATUS_TAG[p.status];

  const save = () =>
    startTransition(async () => {
      const res = await updateListing({
        productId: p.productId,
        priceNgwee: Math.round(Number(price) * 100),
        stock: Number(stock),
        active,
      });
      if (res.ok) {
        toast(res.message);
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });

  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4 first:pt-0 last:pb-0">
      <div className="min-w-[200px] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14.5px] font-bold">{p.name}</span>
          {tag && <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ${tag.style}`}>{tag.label}</span>}
        </div>
        <div className="text-[12.5px] text-ink-50">{p.detail}</div>
        {p.status === "REJECTED" && p.reviewNote && (
          <div className="mt-1 text-[12.5px] text-[#9b2c2c]">{p.reviewNote}</div>
        )}
      </div>

      <label className="block">
        <span className="mb-1 block text-[11.5px] font-bold text-ink-55">Price (K)</span>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal"
          className="w-[96px] rounded-inner bg-surface px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-green"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11.5px] font-bold text-ink-55">In stock</span>
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          inputMode="numeric"
          className="w-[80px] rounded-inner bg-surface px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-green"
        />
      </label>
      <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-70">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-green)]"
        />
        Listed
      </label>
      <button type="button" className="btn btn-secondary !px-4 !py-2 !text-[13px]" disabled={pending || !dirty} onClick={save}>
        {pending ? "Saving…" : "Save"}
      </button>
    </li>
  );
}
