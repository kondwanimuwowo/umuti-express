import { requireStaff } from "@/lib/staff";
import { getCategories, getPharmacyListings } from "@/lib/queries";
import { ProductsView } from "./ProductsView";

export const metadata = { title: "Products | Umuti Express" };

export default async function ProductsPage() {
  const { pharmacy } = await requireStaff("/dashboard/products");
  const [listings, categories] = await Promise.all([getPharmacyListings(pharmacy.id), getCategories()]);

  return (
    <ProductsView
      categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      listings={listings.map((l) => ({
        productId: l.productId,
        name: l.product.name,
        detail: [l.product.genericName, l.product.strength, l.product.form, l.product.packSize].filter(Boolean).join(" · "),
        priceNgwee: l.priceNgwee,
        stock: l.stock,
        active: l.active,
        status: l.product.status,
        reviewNote: l.product.reviewNote,
      }))}
    />
  );
}
