import { requireStaff } from "@/lib/staff";
import { getPharmacistProfile } from "@/lib/queries";
import { VERIFICATION_COPY, getVerificationState } from "@/lib/verification";
import { fmtDate } from "@/lib/format";
import { VerificationForm } from "./VerificationForm";

export const metadata = { title: "Verification | Umuti Express" };

const TONE = {
  VERIFIED: "bg-green-tint text-green-dark",
  PENDING: "bg-amber-tint text-amber",
  NONE: "bg-amber-tint text-amber",
  EXPIRED: "bg-[#fbe4e4] text-[#9b2c2c]",
  REJECTED: "bg-[#fbe4e4] text-[#9b2c2c]",
  SUSPENDED: "bg-[#fbe4e4] text-[#9b2c2c]",
} as const;

export default async function VerificationPage() {
  const { profile } = await requireStaff("/dashboard/verification");
  const [verification, record] = await Promise.all([getVerificationState(profile.id), getPharmacistProfile(profile.id)]);
  const { state } = verification;
  const canSubmit = state === "NONE" || state === "REJECTED" || state === "EXPIRED";
  const rejection = record?.documents.find((d) => d.status === "REJECTED" && d.note)?.note;

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[28px] font-bold">Verification</h1>
      <p className="mt-2.5 text-[14.5px] text-ink-62">
        Prescriptions are health records. Only a pharmacist whose licence and practising certificate we have checked can open or decide them.
      </p>

      <section className="mt-8 rounded-card bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[13px] font-bold text-ink-55">Status</div>
            <div className="mt-0.5 text-[14px] text-ink-70">{VERIFICATION_COPY[state].detail}</div>
            {state === "VERIFIED" && verification.expiresOn && (
              <div className="mt-1 text-[12.5px] text-ink-50">Practising certificate valid until {fmtDate(verification.expiresOn)}.</div>
            )}
            {state === "REJECTED" && rejection && <div className="mt-1 text-[13px] text-[#9b2c2c]">Reason: {rejection}</div>}
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold ${TONE[state]}`}>{VERIFICATION_COPY[state].label}</span>
        </div>
      </section>

      {canSubmit && (
        <div className="mt-6">
          <VerificationForm defaultRegistration={record?.registrationNumber ?? ""} />
        </div>
      )}
    </div>
  );
}
