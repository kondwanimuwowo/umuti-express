import type { LegalDocType } from "@/generated/prisma";
import { consultationTerms } from "./consultation-terms";
import { medicalDisclaimer } from "./medical-disclaimer";
import { partnerAgreement } from "./partner-agreement";
import { privacy } from "./privacy";
import { terms } from "./terms";
import type { Block, LegalContent } from "./types";

export const LEGAL_DOCUMENTS: LegalContent[] = [terms, privacy, medicalDisclaimer, partnerAgreement, consultationTerms];

export function getLegalBySlug(slug: string) {
  return LEGAL_DOCUMENTS.find((d) => d.slug === slug) ?? null;
}

/** The current text of one kind of document. */
export function getCurrentLegal(type: LegalDocType): LegalContent {
  const doc = LEGAL_DOCUMENTS.find((d) => d.type === type);
  if (!doc) throw new Error(`No legal document of type ${type}.`);
  return doc;
}

/** Plain markdown of a document, stored with each published version so what was accepted can be shown later. */
export function toMarkdown(doc: LegalContent): string {
  const block = (b: Block) => (typeof b === "string" ? b : b.list.map((item) => `- ${item}`).join("\n"));
  return [
    `# ${doc.title}`,
    `Version ${doc.version}, effective ${doc.effectiveDate}`,
    ...doc.sections.map((s, i) => `## ${i + 1}. ${s.heading}\n\n${s.blocks.map(block).join("\n\n")}`),
  ].join("\n\n");
}
