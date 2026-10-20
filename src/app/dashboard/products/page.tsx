import { requireStaff } from "@/lib/staff";
import { getCategories, getPharmacyListings } from "@/lib/queries";
import { AddProduct } from "./AddProduct";
import { ListingRow } from "./ListingRow";

export const metadata = { title: "Products | Umuti Express" };

export default async function ProductsPage() {
  const { pharmacy } = await requireStaff("/dashboard/products");
  const [listings, categories] = await Promise.all([getPharmacyListings(pharmacy.id), getCategories()]);

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[28px] font-bold">Products</h1>
      <p className="mt-2.5 text-[14.5px] text-ink-62">
        Set your own price and stock. Products you switch off, or that sell out, are hidden from customers.
      </p>

      <div className="mt-8">
        <AddProduct categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      </div>

      <section className="mt-8 rounded-card bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-[17px] font-bold">Your products ({listings.length})</h2>
        {listings.length === 0 ? (
          <p className="text-[14px] text-ink-55">Nothing listed yet. Search above to add your first product.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-black/[0.08]">
            {listings.map((l) => (
              <ListingRow
                key={l.id}
                productId={l.productId}
                name={l.product.name}
                detail={[l.product.genericName, l.product.strength, l.product.form, l.product.packSize]
                  .filter(Boolean)
                  .join(" · ")}
                priceNgwee={l.priceNgwee}
                stock={l.stock}
                active={l.active}
                status={l.product.status}
                reviewNote={l.product.reviewNote}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
