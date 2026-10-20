"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateListing } from "@/lib/actions/inventory";
import { useToast } from "@/components/Toast";

export const ROW_GRID = "md:grid md:grid-cols-[minmax(0,1fr)_120px_96px_72px_76px] md:items-center md:gap-4";

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

const input =
  "w-full rounded-inner bg-surface px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-green";

export function ListingRow(p: Props) {
  const [price, setPrice] = useState((p.priceNgwee / 100).toFixed(2));
  const [stock, setStock] = useState(String(p.stock));
  const [active, setActive] = useState(p.active);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const dirty = Math.round(Number(price) * 100) !== p.priceNgwee || Number(stock) !== p.stock || active !== p.active;
  const tag = p.status === "APPROVED" ? null : STATUS_TAG[p.status];
  const soldOut = p.status === "APPROVED" && p.stock === 0;

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
    <li className={`flex flex-col gap-3 px-5 py-4 md:py-3.5 ${ROW_GRID}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14.5px] font-bold">{p.name}</span>
          {tag && <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${tag.style}`}>{tag.label}</span>}
          {soldOut && <span className="rounded-full bg-amber-tint px-2.5 py-0.5 text-[11.5px] font-bold text-amber">Sold out</span>}
        </div>
        {p.detail && <div className="truncate text-[12.5px] text-ink-50">{p.detail}</div>}
        {p.status === "REJECTED" && p.reviewNote && <div className="mt-1 text-[12.5px] text-[#9b2c2c]">{p.reviewNote}</div>}
      </div>

      <div className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-3 md:contents">
        <label className="block">
          <span className="mb-1 block text-[11.5px] font-bold text-ink-55 md:sr-only">Price (K)</span>
          <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" aria-label="Price in kwacha" className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11.5px] font-bold text-ink-55 md:sr-only">In stock</span>
          <input value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" aria-label="Units in stock" className={input} />
        </label>

        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-label={active ? "Listed for customers" : "Hidden from customers"}
          onClick={() => setActive((a) => !a)}
          className={`relative mt-5 h-6 w-11 shrink-0 rounded-full transition-colors md:mt-0 md:justify-self-center ${active ? "bg-green" : "bg-ink-40"}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${active ? "translate-x-5" : ""}`} />
        </button>

        <button
          type="button"
          className="btn btn-primary mt-5 !px-4 !py-2 !text-[13px] md:mt-0 disabled:invisible"
          disabled={pending || !dirty}
          onClick={save}
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </li>
  );
}
