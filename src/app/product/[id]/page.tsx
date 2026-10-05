import Link from "next/link";
import { notFound } from "next/navigation";
import { getPharmacies, getProduct, getRelatedProducts } from "@/lib/queries";
import { getProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtK, RX_STATUS_LABEL } from "@/lib/format";
import { ImageSlot } from "@/components/ImageSlot";
import { ProductCard } from "@/components/ProductCard";
import { AddToCartButton } from "@/components/AddToCartButton";
import { QtyAddToCart } from "@/components/QtyAddToCart";
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

  const [pharmacies, related, profile] = await Promise.all([
    getPharmacies(),
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
          <div className="mt-3 font-display text-[26px] font-bold text-green-dark">{fmtK(product.priceNgwee)}</div>

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

          <div className="mt-7">
            {product.rx && !rxApproved ? (
              <AddToCartButton productId={product.id} rx inStock={product.inStock} large />
            ) : (
              <QtyAddToCart productId={product.id} rx={product.rx} rxApproved={rxApproved} inStock={product.inStock} />
            )}
          </div>

          <div className="mt-10 border-t border-black/[0.08] pt-7">
            <h2 className="mb-4 font-display text-[14.5px] font-bold">Available at nearby pharmacies</h2>
            <ul className="flex flex-col gap-3">
              {pharmacies.slice(0, 3).map((ph) => (
                <li
                  key={ph.id}
                  className="flex items-center justify-between gap-4 rounded-inner bg-white px-4 py-3 shadow-nav"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-bold">{ph.name}</div>
                    <div className="text-[12.5px] text-ink-55">{ph.area}</div>
                  </div>
                  <span className="shrink-0 text-[12.5px] font-bold text-green-dark">{ph.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

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
