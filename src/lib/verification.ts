import { prisma } from "@/lib/prisma";

export type VerificationState = "NONE" | "PENDING" | "VERIFIED" | "EXPIRED" | "REJECTED" | "SUSPENDED";

/**
 * Whether a person may review prescriptions. They must have been verified by an admin, and their
 * practising certificate must still be in date: an expired certificate stops reviews at once,
 * without waiting for anyone to suspend the account.
 */
export async function getVerificationState(profileId: string) {
  const record = await prisma.pharmacistProfile.findUnique({
    where: { profileId },
    include: {
      documents: { where: { type: "PRACTISING_CERTIFICATE" }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!record) return { state: "NONE" as VerificationState, expiresOn: null, note: null };

  const certificate = record.documents[0];
  const expiresOn = certificate?.expiresOn ?? null;

  let state: VerificationState = record.status;
  if (record.status === "VERIFIED" && (!expiresOn || expiresOn.getTime() < Date.now())) state = "EXPIRED";

  return { state, expiresOn, note: certificate?.note ?? null };
}

export const VERIFICATION_COPY: Record<VerificationState, { label: string; detail: string }> = {
  NONE: { label: "Not submitted", detail: "Submit your licence and practising certificate to review prescriptions." },
  PENDING: { label: "Under review", detail: "Our team is checking your documents." },
  VERIFIED: { label: "Verified", detail: "You can review prescriptions." },
  EXPIRED: { label: "Certificate expired", detail: "Upload a current practising certificate to review prescriptions again." },
  REJECTED: { label: "Not approved", detail: "Your documents were not accepted. Submit them again." },
  SUSPENDED: { label: "Suspended", detail: "Your verification has been suspended. Contact our team." },
};
