import Link from "next/link";
import { fmtK } from "@/lib/format";
import { ImageSlot } from "./ImageSlot";
import { AddToCartButton } from "./AddToCartButton";
import type { Category, Product } from "@/generated/prisma";

export type ProductWithCategory = Product & { category: Category };

export function ProductCard({
  product: p,
  showCategory = false,
}: {
  product: ProductWithCategory;
  showCategory?: boolean;
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-float">
      <Link href={`/product/${p.id}`} className="block" tabIndex={-1} aria-hidden="true">
        <ImageSlot src={p.imageSrc} position={p.imagePosition} placeholder={`Photo: ${p.name}`} className="h-[168px] w-full" />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {p.rx && (
          <span className="w-fit rounded-full bg-amber-tint px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber uppercase">
            Prescription needed
          </span>
        )}

        <h3 className="font-display text-[15.5px] leading-snug font-bold">
          {/* The whole card is clickable through this link's ::after overlay. */}
          <Link href={`/product/${p.id}`} className="after:absolute after:inset-0 after:content-['']">
            {p.name}
          </Link>
        </h3>

        {showCategory && <p className="text-[13px] text-ink-55">{p.category.name}</p>}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="font-display text-[16.5px] font-bold text-green-dark">{fmtK(p.priceNgwee)}</span>
          {/* Sits above the overlay so Add does not navigate. */}
          <div className="relative z-10">
            <AddToCartButton productId={p.id} rx={p.rx} inStock={p.inStock} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
