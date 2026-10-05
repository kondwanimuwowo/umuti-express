import Link from "next/link";
import { getCategories, getProducts } from "@/lib/queries";
import { ImageSlot } from "@/components/ImageSlot";
import { ProductCard } from "@/components/ProductCard";
import { SearchForm } from "@/components/SearchForm";
import { CategoryIcon } from "@/components/icons";

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <div>
      {/* Compact hero: search and categories, so the products start high on the page. */}
      <section className="bg-navy py-10">
        <div className="shell-container">
          <h1 className="max-w-[640px] font-display text-[26px] leading-tight font-bold text-white sm:text-[32px]">
            Order medicine without leaving home
          </h1>
          <p className="mt-2.5 max-w-[520px] text-[14.5px] leading-relaxed text-white/70">
            Medicines from pharmacies across Lusaka, delivered or ready for pickup.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <SearchForm />
            <Link href="/pharmacies" className="btn btn-on-dark">
              Find nearby pharmacy
            </Link>
          </div>
        </div>
      </section>

      <section className="shell-container -mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-inner bg-white px-3 py-4 text-center text-[13px] font-semibold text-ink no-underline shadow-card transition-shadow hover:shadow-float"
            >
              <CategoryIcon id={c.slug} />
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* The catalogue, grouped by category, is the body of the homepage. */}
      {categories.map((c) => {
        const inCategory = products.filter((p) => p.categorySlug === c.slug);
        if (inCategory.length === 0) return null;

        return (
          <section key={c.slug} className="shell-container mt-12">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="font-display text-[20px] font-bold">{c.name}</h2>
              <Link
                href={`/shop?category=${c.slug}`}
                className="text-[13.5px] font-bold text-green-dark no-underline hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {inCategory.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="shell-container mt-16">
        <div className="grid items-center gap-8 rounded-card bg-white p-6 shadow-card lg:grid-cols-2 lg:p-8">
          <ImageSlot
            src="/images/pharmacy-map.webp"
            position="50% 31%"
            placeholder="Map of nearby partner pharmacies"
            className="h-[260px] w-full rounded-card"
          />
          <div>
            <h2 className="font-display text-[22px] leading-tight font-bold">Pick up from a pharmacy near you</h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-70">
              We work with pharmacies across Lusaka. Search by area to see opening hours, distance and stock.
            </p>
            <Link href="/pharmacies" className="btn btn-primary btn-lg mt-5">
              Find a pharmacy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
