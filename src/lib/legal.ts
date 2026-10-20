import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { fillLegalText } from "@/lib/company";
import { getCurrentLegal, toMarkdown } from "@/content/legal";
import type { LegalDocType } from "@/generated/prisma";

/** The stored row for the current version of a document, created the first time it is needed. */
async function ensureDocument(type: LegalDocType) {
  const doc = getCurrentLegal(type);
  return prisma.legalDocument.upsert({
    where: { type_version: { type, version: doc.version } },
    create: { type, version: doc.version, title: doc.title, body: fillLegalText(toMarkdown(doc)) },
    update: {},
  });
}

async function clientIp() {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  } catch {
    // Not inside a request (a script or a job): the acceptance is still recorded, without an address.
    return null;
  }
}

/**
 * Record that a person accepted the current version of each document. Accepting again is a no-op,
 * and a newer version of a document is a new row that has to be accepted afresh.
 */
export async function recordAcceptance(input: { profileId: string; types: LegalDocType[]; pharmacyId?: string }) {
  const ip = await clientIp();
  for (const type of input.types) {
    const document = await ensureDocument(type);
    await prisma.legalAcceptance.upsert({
      where: { documentId_profileId: { documentId: document.id, profileId: input.profileId } },
      create: { documentId: document.id, profileId: input.profileId, pharmacyId: input.pharmacyId, ip },
      update: {},
    });
  }
}

/** Whether a person has accepted the current version of a document. */
export async function hasAcceptedCurrent(profileId: string, type: LegalDocType) {
  const doc = getCurrentLegal(type);
  const found = await prisma.legalAcceptance.findFirst({
    where: { profileId, document: { type, version: doc.version } },
    select: { id: true },
  });
  return found !== null;
}
