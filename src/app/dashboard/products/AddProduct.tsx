"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addListing, createProduct, searchForListing, type SimilarProduct } from "@/lib/actions/inventory";
import type { CatalogueMatch } from "@/lib/queries";
import { Field } from "@/components/PharmacyFields";
import { useToast } from "@/components/Toast";

type Category = { slug: string; name: string };

const detail = (p: { genericName?: string | null; strength?: string | null; form?: string | null; packSize?: string | null }) =>
  [p.genericName, p.strength, p.form, p.packSize].filter(Boolean).join(" · ");

export function AddProduct({ categories, onClose }: { categories: Category[]; onClose?: () => void }) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<CatalogueMatch[]>([]);
  const [searched, setSearched] = useState(false);
  const [chosen, setChosen] = useState<CatalogueMatch | null>(null);
  const [creating, setCreating] = useState(false);
  const [similar, setSimilar] = useState<SimilarProduct[]>([]);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  // Search as the pharmacy types, waiting for a short pause.
  useEffect(() => {
    if (chosen || creating) return;
    if (query.trim().length < 2) {
      setMatches([]);
      setSearched(false);
      return;
    }
    let stale = false;
    const timer = setTimeout(async () => {
      const found = await searchForListing(query);
      if (!stale) {
        setMatches(found);
        setSearched(true);
      }
    }, 250);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query, chosen, creating]);

  const reset = () => {
    setQuery("");
    setMatches([]);
    setSearched(false);
    setChosen(null);
    setCreating(false);
    setSimilar([]);
    router.refresh();
    onClose?.();
  };

  const submitListing = (formData: FormData) =>
    startTransition(async () => {
      if (!chosen) return;
      const res = await addListing({
        productId: chosen.id,
        priceNgwee: Math.round(Number(formData.get("price")) * 100),
        stock: Number(formData.get("stock")),
      });
      if (res.ok) {
        toast(res.message);
        reset();
      } else {
        toast(res.error, "error");
      }
    });

  const submitNew = (formData: FormData, confirmSimilar: boolean) =>
    startTransition(async () => {
      const value = (key: string) => String(formData.get(key) ?? "");
      const res = await createProduct({
        name: value("name"),
        genericName: value("genericName"),
        aliases: value("aliases"),
        strength: value("strength"),
        form: value("form"),
        packSize: value("packSize"),
        categorySlug: value("categorySlug"),
        priceNgwee: Math.round(Number(value("price")) * 100),
        stock: Number(value("stock")),
        confirmSimilar,
      });
      if (res.ok) {
        toast(res.message);
        reset();
      } else if (res.code === "SIMILAR") {
        setSimilar(res.similar ?? []);
      } else {
        toast(res.error, "error");
      }
    });

  return (
    <section className="rounded-card bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-[17px] font-bold">Add a product</h2>
        <button type="button" onClick={reset} className="text-[13px] font-bold text-ink-50 hover:text-ink">
          Close
        </button>
      </div>
      <p className="mt-1 text-[13.5px] text-ink-62">
        Search first. If another pharmacy has already added it, you only set your price and stock.
      </p>

      {!creating && !chosen && (
        <div className="mt-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or active ingredient, e.g. paracetamol"
            aria-label="Search the catalogue"
            className="w-full rounded-full bg-surface px-5 py-3 text-[14.5px] outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green"
          />

          {matches.length > 0 && (
            <ul className="mt-3 flex flex-col divide-y divide-black/[0.08] rounded-inner border border-black/[0.08]">
              {matches.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-bold">{m.name}</div>
                    <div className="truncate text-[12.5px] text-ink-50">{detail(m)}</div>
                  </div>
                  {m.listed ? (
                    <span className="shrink-0 text-[12.5px] font-semibold text-ink-50">Already listed</span>
                  ) : (
                    <button type="button" className="btn btn-secondary !px-4 !py-2 !text-[13px]" onClick={() => setChosen(m)}>
                      Add
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {searched && (
            <p className="mt-3 text-[13.5px] text-ink-62">
              {matches.length === 0 ? "Nothing matches. " : "Not the one you want? "}
              <button type="button" className="font-bold text-green-dark" onClick={() => setCreating(true)}>
                Add a new product
              </button>
            </p>
          )}
        </div>
      )}

      {chosen && (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitListing(new FormData(e.currentTarget));
          }}
        >
          <div className="rounded-inner bg-surface px-4 py-3">
            <div className="text-[14px] font-bold">{chosen.name}</div>
            <div className="text-[12.5px] text-ink-50">{detail(chosen)}</div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Your price (K)" name="price" type="text" placeholder="25.00" required />
            <Field label="Units in stock" name="stock" type="text" placeholder="50" required />
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Adding…" : "Add to my products"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={reset}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {creating && (
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitNew(new FormData(e.currentTarget), similar.length > 0);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product name" name="name" placeholder="Brand and strength, e.g. Panadol Extra" required />
            <Field label="Active ingredient" name="genericName" placeholder="Paracetamol" />
            <Field label="Strength" name="strength" placeholder="500mg" />
            <Field label="Form" name="form" placeholder="Tablet, syrup, gel" />
            <Field label="Pack size" name="packSize" placeholder="20 tablets" />
            <Field label="Other names people search for" name="aliases" placeholder="Panado, comma separated" />
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-bold text-ink-70">Category</span>
              <select
                name="categorySlug"
                required
                defaultValue=""
                className="w-full rounded-inner bg-surface px-4 py-3 text-[14.5px] text-ink outline-none focus:ring-2 focus:ring-green"
              >
                <option value="" disabled>
                  Choose
                </option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Your price (K)" name="price" placeholder="25.00" required />
              <Field label="Units in stock" name="stock" placeholder="50" required />
            </div>
          </div>

          {similar.length > 0 && (
            <div className="mt-5 rounded-inner bg-amber-tint px-4 py-3 text-[13.5px] text-amber">
              <div className="font-bold">The catalogue already has something similar:</div>
              <ul className="mt-1.5 flex flex-col gap-1">
                {similar.map((s) => (
                  <li key={s.id}>
                    {s.name}
                    {detail(s) && <span className="opacity-80"> &middot; {detail(s)}</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-2">If yours is the same product, cancel and search for it. Otherwise submit again to add it as new.</p>
            </div>
          )}

          <p className="mt-4 text-[12.5px] text-ink-50">
            New products are checked by Umuti Express before customers can see them.
          </p>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Submitting…" : similar.length > 0 ? "Add as a new product" : "Submit for approval"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={reset}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
