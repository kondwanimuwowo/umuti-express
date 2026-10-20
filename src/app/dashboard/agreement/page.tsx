import Link from "next/link";
import { requireOwner } from "@/lib/staff";
import { hasAcceptedCurrent } from "@/lib/legal";
import { getCurrentLegal } from "@/content/legal";
import { AcceptAgreement } from "./AcceptAgreement";

export const metadata = { title: "Partner agreement | Umuti Express" };

export default async function AgreementPage() {
  const { profile, pharmacy } = await requireOwner("/dashboard/agreement");
  const doc = getCurrentLegal("PARTNER");
  const accepted = await hasAcceptedCurrent(profile.id, "PARTNER");

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[28px] font-bold">Partner agreement</h1>
      <p className="mt-2.5 text-[14.5px] text-ink-62">
        The agreement between Umuti Express and {pharmacy.name}. The owner accepts each version on the pharmacy&apos;s behalf.
      </p>

      <section className="mt-8 rounded-card bg-white p-6 shadow-card">
        <div className="font-display text-[17px] font-bold">{doc.title}</div>
        <div className="mt-1 text-[13px] text-ink-55">
          Version {doc.version} &middot; Effective {doc.effectiveDate}
        </div>
        <Link href={`/legal/${doc.slug}`} target="_blank" className="mt-3 inline-block text-[14px] font-bold text-green-dark">
          Read the full agreement
        </Link>

        {accepted ? (
          <p className="mt-5 rounded-inner bg-green-tint px-4 py-3 text-[14px] font-semibold text-green-dark">
            You have accepted this version.
          </p>
        ) : (
          <AcceptAgreement />
        )}
      </section>
    </div>
  );
}
