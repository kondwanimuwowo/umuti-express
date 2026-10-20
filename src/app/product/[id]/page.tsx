import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getRelatedProducts, getSameIngredient } from "@/lib/queries";
import { getProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtK, RX_STATUS_LABEL } from "@/lib/format";
import { ImageSlot } from "@/components/ImageSlot";
import { ProductCard } from "@/components/ProductCard";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ChevronLeft } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const product = await getProduct(Number((await params).id));
  return { title: product ? `${product.name} | Umuti Express` : "Umuti Express" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const product = await getProduct(id);
  if (!product) notFound();

  const [sameIngredient, related, profile] = await Promise.all([
    getSameIngredient(product.genericName, product.id),
    getRelatedProducts(product.categorySlug, product.id),
    getProfile(),
  ]);

  // Latest prescription for this product, to show where the request stands.
  const rx =
    product.rx && profile
      ? await prisma.prescription.findFirst({
          where: { profileId: profile.id, productId: product.id },
          orderBy: { createdAt: "desc" },
        })
      : null;
  const rxApproved = rx?.status === "APPROVED";

  const listings = product.pharmacyProducts;
  const inStock = listings.filter((l) => l.stock > 0);
  const fromPriceNgwee = inStock.length ? Math.min(...inStock.map((l) => l.priceNgwee)) : null;

  const details = [product.strength, product.form, product.packSize].filter(Boolean).join(" · ");

  return (
    <div className="shell-container py-8">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-62 no-underline hover:text-ink"
      >
        <ChevronLeft />
        Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ImageSlot
          src={product.imageSrc}
          position={product.imagePosition}
          placeholder={`Photo: ${product.name}`}
          className="h-[340px] w-full rounded-card shadow-card"
          eager
        />

        <div>
          <div className="text-[13px] font-bold text-ink-50">{product.category.name}</div>
          <h1 className="mt-2 font-display text-[30px] leading-tight font-bold">{product.name}</h1>
          {details && <p className="mt-1.5 text-[14px] text-ink-55">{details}</p>}
          {product.genericName && (
            <p className="mt-1 text-[14px] text-ink-55">Active ingredient: {product.genericName}</p>
          )}

          <div className="mt-3 font-display text-[26px] font-bold text-green-dark">
            {fromPriceNgwee !== null ? (
              <>
                {inStock.length > 1 && <span className="mr-1.5 text-[14px] font-semibold text-ink-55">From</span>}
                {fmtK(fromPriceNgwee)}
              </>
            ) : (
              <span className="text-[16px] font-semibold text-ink-55">Not currently listed</span>
            )}
          </div>

          {product.rx && (
            <div className="mt-4 rounded-inner bg-amber-tint px-4 py-3 text-[13.5px] leading-relaxed text-amber">
              <strong className="font-bold">Prescription required.</strong>{" "}
              {rx
                ? RX_STATUS_LABEL[rx.status]
                : "Upload your prescription and a licensed pharmacist will review it before you can order."}
              {rx?.note && <div className="mt-1.5 text-amber/90">Pharmacist note: {rx.note}</div>}
            </div>
          )}

          <p className="mt-5 text-[15px] leading-relaxed text-ink-70">{product.blurb}</p>

          <div className="mt-10 border-t border-black/[0.08] pt-7">
            <h2 className="mb-4 font-display text-[14.5px] font-bold">
              Listed by {listings.length} {listings.length === 1 ? "pharmacy" : "pharmacies"}
            </h2>
            {listings.length === 0 ? (
              <p className="text-[14px] text-ink-55">No pharmacy lists this product at the moment.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {listings.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-4 rounded-inner bg-white px-4 py-3 shadow-nav"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-bold">{l.pharmacy.name}</div>
                      <div className="text-[12.5px] text-ink-55">
                        {l.pharmacy.area} &middot; {l.pharmacy.hours}
                      </div>
                      <div className="mt-0.5 text-[12px] text-ink-50">
                        {l.pharmacy.offersDelivery ? "Pickup or delivery" : "Pickup only"}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="font-display text-[16px] font-bold text-green-dark">{fmtK(l.priceNgwee)}</span>
                      <AddToCartButton
                        productId={product.id}
                        pharmacyId={l.pharmacyId}
                        rx={product.rx}
                        rxApproved={rxApproved}
                        inStock={l.stock > 0}
                        compact
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {sameIngredient.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-1 font-display text-[20px] font-bold">Same active ingredient</h2>
          <p className="mb-4 text-[13.5px] text-ink-55">
            Other brands containing {product.genericName}. Ask a pharmacist before switching medicines.
          </p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {sameIngredient.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-display text-[20px] font-bold">More in {product.category.name}</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
