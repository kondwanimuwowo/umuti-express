import Link from "next/link";
import { requireStaff } from "@/lib/staff";
import { getReviewQueue } from "@/lib/queries";
import { VERIFICATION_COPY, getVerificationState } from "@/lib/verification";
import { RX_STATUS_LABEL, fmtDate, fmtTime } from "@/lib/format";
import { ReviewCard } from "./ReviewCard";

export const metadata = { title: "Prescription review | Umuti Express" };

export default async function PrescriptionsPage() {
  const { profile: staff, pharmacy } = await requireStaff("/dashboard/prescriptions");
  const [queue, verification] = await Promise.all([getReviewQueue(pharmacy.id), getVerificationState(staff.id)]);
  const verified = verification.state === "VERIFIED";

  const pending = queue.filter((rx) => rx.status === "PENDING");
  const decided = queue.filter((rx) => rx.status !== "PENDING");

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[28px] font-bold">Prescription review</h1>
      <p className="mt-2.5 text-[14.5px] text-ink-62">
        Prescriptions uploaded for orders placed with {pharmacy.name}. A customer pays only after one is approved, and one refusal cancels the order.
      </p>

      {!verified && (
        <div className="mt-7 rounded-card bg-amber-tint px-5 py-4 text-[14px] leading-relaxed text-amber">
          <strong className="font-bold">{VERIFICATION_COPY[verification.state].label}.</strong>{" "}
          {VERIFICATION_COPY[verification.state].detail} Only a verified pharmacist can open or decide prescriptions.{" "}
          <Link href="/dashboard/verification" className="font-bold underline">
            Go to verification
          </Link>
        </div>
      )}

      <section className="mt-9">
        <h2 className="mb-4 text-[18px] font-bold">
          Awaiting review{pending.length > 0 && <span className="ml-2 text-ink-50">({pending.length})</span>}
        </h2>

        {!verified ? (
          <p className="rounded-card bg-white p-8 text-center text-[15px] text-ink-55 shadow-card">
            {pending.length > 0 ? `${pending.length} waiting for a verified pharmacist.` : "Nothing waiting."}
          </p>
        ) : pending.length === 0 ? (
          <p className="rounded-card bg-white p-8 text-center text-[15px] text-ink-55 shadow-card">
            Nothing waiting. New uploads appear here.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map((rx) => (
              <ReviewCard
                key={rx.id}
                id={rx.id}
                productName={rx.product.name}
                productId={rx.productId}
                patientName={rx.profile.fullName ?? rx.profile.email}
                patientPhone={rx.profile.phone}
                orderCode={rx.order?.code ?? ""}
                isPdf={rx.imagePath.toLowerCase().endsWith(".pdf")}
                uploadedAt={`${fmtDate(rx.createdAt)} at ${fmtTime(rx.createdAt)}`}
              />
            ))}
          </div>
        )}
      </section>

      {decided.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-[18px] font-bold">Recently decided</h2>
          <ul className="flex flex-col gap-2">
            {decided.map((rx) => (
              <li
                key={rx.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-inner bg-white px-4 py-3 shadow-nav"
              >
                <div className="min-w-0">
                  <Link
                    href={`/product/${rx.productId}`}
                    className="text-[14px] font-bold text-ink no-underline hover:underline"
                  >
                    {rx.product.name}
                  </Link>
                  <div className="text-[12.5px] text-ink-50">
                    {rx.order?.code} &middot; {rx.profile.fullName ?? rx.profile.email} &middot;{" "}
                    {rx.reviewedAt ? fmtDate(rx.reviewedAt) : fmtDate(rx.createdAt)}
                    {rx.reviewer?.fullName && ` · by ${rx.reviewer.fullName}`}
                  </div>
                  {rx.note && <div className="mt-1 text-[12.5px] text-ink-62">Note: {rx.note}</div>}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold ${
                    rx.status === "APPROVED" ? "bg-green-tint text-green-dark" : "bg-[#fbe4e4] text-[#9b2c2c]"
                  }`}
                >
                  {RX_STATUS_LABEL[rx.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
