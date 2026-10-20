import { requireAdmin } from "@/lib/staff";
import { getCatalogueQueue, getCategories, searchApprovedProducts } from "@/lib/queries";
import { ProductReviewCard } from "./ProductReviewCard";

export const metadata = { title: "Catalogue | Umuti Express" };

export default async function CataloguePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin("/dashboard/admin/catalogue");
  const q = ((await searchParams).q ?? "").trim();

  const [queue, categories, found] = await Promise.all([
    getCatalogueQueue(),
    getCategories(),
    q ? searchApprovedProducts(q) : Promise.resolve([]),
  ]);
  const cats = categories.map((c) => ({ slug: c.slug, name: c.name }));

  const card = (p: (typeof queue)[number]) => (
    <ProductReviewCard
      key={`${p.id}-${p.updatedAt.getTime()}`}
      id={p.id}
      status={p.status}
      name={p.name}
      genericName={p.genericName}
      aliases={p.aliases}
      strength={p.strength}
      form={p.form}
      packSize={p.packSize}
      blurb={p.blurb}
      categorySlug={p.categorySlug}
      classification={p.classification}
      addedBy={p.createdByPharmacy?.name ?? null}
      categories={cats}
    />
  );

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[28px] font-bold">Catalogue</h1>
      <p className="mt-2.5 text-[14.5px] text-ink-62">
        {queue.length > 0 ? `${queue.length} awaiting approval.` : "No products waiting."} Set the classification
        before approving: only you can change it.
      </p>

      <div className="mt-8 flex flex-col gap-5">{queue.map(card)}</div>

      <h2 className="mt-12 font-display text-[19px] font-bold">Find a product</h2>
      <form className="mt-3" action="/dashboard/admin/catalogue">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search approved products to edit or re-classify"
          aria-label="Search approved products"
          className="w-full rounded-full bg-white px-5 py-3 text-[14.5px] shadow-nav outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green"
        />
      </form>
      {q && found.length === 0 && <p className="mt-4 text-[14px] text-ink-55">No approved products match.</p>}
      <div className="mt-5 flex flex-col gap-5">{found.map(card)}</div>
    </div>
  );
}
