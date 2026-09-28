"use client";

import Link from "next/link";
import { catName, fmtK, type Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ImageSlot } from "./ImageSlot";

export function ProductCard({ product: p, showCategory = false }: { product: Product; showCategory?: boolean }) {
  const { addToCart } = useStore();
  return (
    <Link href={`/product/${p.id}`} className="card product-card">
      <ImageSlot id={`product-${p.id}`} placeholder={`Photo: ${p.name}`} />
      <div className="product-body">
        {p.rx && <span className="badge-rx">Prescription needed</span>}
        <div className="product-name">{p.name}</div>
        {showCategory && <div className="product-cat">{catName(p.category)}</div>}
        <div className="product-foot">
          <span className="price">{fmtK(p.price)}</span>
          <button
            className="btn btn-soft btn-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(p.id, 1);
            }}
          >
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
