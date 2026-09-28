import { notFound } from "next/navigation";
import { PRODUCTS, findProduct } from "@/lib/data";
import { ProductView } from "./ProductView";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = findProduct(Number((await params).id));
  return { title: p ? `${p.name} | Umuti Express` : "Umuti Express" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = findProduct(Number((await params).id));
  if (!product) notFound();
  return <ProductView product={product} />;
}
