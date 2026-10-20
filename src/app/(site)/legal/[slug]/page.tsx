import { notFound } from "next/navigation";
import { LEGAL_DOCUMENTS, getLegalBySlug } from "@/content/legal";
import { LegalText } from "@/components/LegalText";

export function generateStaticParams() {
  return LEGAL_DOCUMENTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const doc = getLegalBySlug((await params).slug);
  return { title: doc ? `${doc.title} | Umuti Express` : "Umuti Express" };
}

export default async function LegalDocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const doc = getLegalBySlug((await params).slug);
  if (!doc) notFound();
  return <LegalText doc={doc} />;
}
