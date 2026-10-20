"use client";

import { useMemo, useState } from "react";
import { AddProduct } from "./AddProduct";
import { ListingRow, ROW_GRID } from "./ListingRow";

export type Listing = {
  productId: number;
  name: string;
  detail: string;
  priceNgwee: number;
  stock: number;
  active: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
};

type Filter = "all" | "soldOut" | "review";

export function ProductsView({ listings, categories }: { listings: Listing[]; categories: { slug: string; name: string }[] }) {
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const soldOut = (l: Listing) => l.status === "APPROVED" && l.stock === 0;
  const counts = {
    all: listings.length,
    soldOut: listings.filter(soldOut).length,
    review: listings.filter((l) => l.status !== "APPROVED").length,
  };

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return listings.filter((l) => {
      if (filter === "soldOut" && !soldOut(l)) return false;
      if (filter === "review" && l.status === "APPROVED") return false;
      return !term || `${l.name} ${l.detail}`.toLowerCase().includes(term);
    });
  }, [listings, filter, q]);

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "soldOut", label: "Sold out" },
    { id: "review", label: "Needs attention" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold">Products</h1>
          <p className="mt-2 text-[14.5px] text-ink-62">
            Your own prices and stock. Switched-off and sold-out products are hidden from customers.
          </p>
        </div>
        {!adding && (
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            Add product
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-7">
          <AddProduct categories={categories} onClose={() => setAdding(false)} />
        </div>
      )}

      <section className="mt-8 overflow-hidden rounded-card bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
                  filter === t.id ? "bg-green text-white" : "bg-surface text-ink-70 hover:text-ink"
                }`}
              >
                {t.label} <span className={filter === t.id ? "text-white/80" : "text-ink-40"}>{counts[t.id]}</span>
              </button>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter your products"
            aria-label="Filter your products"
            className="w-full rounded-full bg-surface px-4 py-2 text-[13.5px] outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green sm:w-[240px]"
          />
        </div>

        {listings.length > 0 && (
          <div className={`hidden border-b border-black/[0.08] px-5 py-2.5 text-[11.5px] font-bold tracking-wider text-ink-50 uppercase ${ROW_GRID}`}>
            <span>Product</span>
            <span>Price (K)</span>
            <span>In stock</span>
            <span className="text-center">Listed</span>
            <span />
          </div>
        )}

        {listings.length === 0 ? (
          <p className="px-5 py-12 text-center text-[14.5px] text-ink-55">
            Nothing listed yet. Use <strong className="text-ink">Add product</strong> to search the catalogue.
          </p>
        ) : shown.length === 0 ? (
          <p className="px-5 py-10 text-center text-[14px] text-ink-55">No products match.</p>
        ) : (
          <ul className="divide-y divide-black/[0.08]">
            {shown.map((l) => (
              <ListingRow key={l.productId} {...l} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
