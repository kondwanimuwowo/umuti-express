import { notFound } from "next/navigation";
import { PRODUCTS, findProduct } from "@/lib/data";
import { PrescriptionView } from "./PrescriptionView";

export const metadata = { title: "Upload your prescription | Umuti Express" };

export function generateStaticParams() {
  return PRODUCTS.filter((p) => p.rx).map((p) => ({ id: String(p.id) }));
}

export default async function PrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const product = findProduct(Number((await params).id));
  if (!product || !product.rx) notFound();
  return <PrescriptionView productId={product.id} />;
}
