import type { LegalDocType } from "@/generated/prisma";

/** A paragraph, or a bulleted list. */
export type Block = string | { list: string[] };

export type LegalSection = { heading: string; blocks: Block[] };

export type LegalContent = {
  slug: string;
  type: LegalDocType;
  title: string;
  /** Bump when the text changes. A new version has to be accepted again. */
  version: string;
  effectiveDate: string;
  /** One line shown under the title and in the index. */
  summary: string;
  sections: LegalSection[];
};
