import Link from "next/link";
import { getCategories, getProducts } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";
import { SearchForm } from "@/components/SearchForm";

export const metadata = { title: "Shop medicines | Umuti Express" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ q, category }),
  ]);

  const active = categories.find((c) => c.slug === category) ?? null;

  return (
    <div className="shell-container py-10">
      <h1 className="font-display text-[28px] font-bold">Shop medicines</h1>

      <div className="mt-5">
        <SearchForm initial={q ?? ""} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip href={buildHref({ q })} active={!active}>
          All
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c.slug} href={buildHref({ q, category: c.slug })} active={active?.slug === c.slug}>
            {c.name}
          </FilterChip>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-ink-50">
          No medicines match {q ? `“${q}”` : "that filter"}.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} showCategory />
          ))}
        </div>
      )}
    </div>
  );
}

function buildHref({ q, category }: { q?: string; category?: string }) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (category) sp.set("category", category);
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`rounded-full px-4 py-2 text-[13.5px] font-semibold no-underline transition-colors ${
        active ? "bg-green text-white" : "bg-white text-ink-70 shadow-nav hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
