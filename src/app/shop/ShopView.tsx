"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES, PRODUCTS, isCategoryId } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { SearchIcon } from "@/components/icons";

export function ShopView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const categoryParam = params.get("category");
  const category = isCategoryId(categoryParam) ? categoryParam : null;
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => setQ(params.get("q") ?? ""), [params]);

  const updateUrl = (next: { q?: string; category?: string | null }) => {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) (next.q ? sp.set("q", next.q) : sp.delete("q"));
    if (next.category !== undefined) (next.category ? sp.set("category", next.category) : sp.delete("category"));
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const products = PRODUCTS.filter(
    (p) => (!category || p.category === category) && (!q || p.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="container page">
      <h1 className="page-title">Shop medicines</h1>
      <div className="search" style={{ background: "var(--surface)", marginBottom: 24, maxWidth: 520 }}>
        <SearchIcon />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            updateUrl({ q: e.target.value });
          }}
          placeholder="Search medicines"
          aria-label="Search medicines"
          style={{ padding: "10px 14px" }}
        />
      </div>
      <div className="chips" style={{ marginBottom: 36 }}>
        {[{ id: null, name: "All" }, ...CATEGORIES].map((c) => (
          <button key={c.name} className="chip" aria-pressed={category === c.id} onClick={() => updateUrl({ category: c.id })}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="products">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} showCategory />
        ))}
      </div>
      {products.length === 0 && (
        <div style={{ padding: "64px 0", textAlign: "center", color: "var(--ink-50)", fontSize: 15 }}>No medicines match your search.</div>
      )}
    </div>
  );
}
