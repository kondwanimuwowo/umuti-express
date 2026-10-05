import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getReviewQueue } from "@/lib/queries";
import { RX_STATUS_LABEL, fmtDate, fmtTime } from "@/lib/format";
import { ReviewCard } from "./ReviewCard";

export const metadata = { title: "Prescription review | Umuti Express" };

export default async function PharmacistPage() {
  const staff = await requireRole(["PHARMACIST", "ADMIN"], "/pharmacist");
  const queue = await getReviewQueue();

  const pending = queue.filter((rx) => rx.status === "PENDING");
  const decided = queue.filter((rx) => rx.status !== "PENDING");

  return (
    <div className="shell-container max-w-[860px] py-12">
      <h1 className="font-display text-[28px] font-bold">Prescription review</h1>
      <p className="mt-2.5 text-[14.5px] text-ink-62">
        Signed in as {staff.fullName ?? staff.email}. Only a pharmacist can approve a prescription item for ordering.
      </p>

      <section className="mt-9">
        <h2 className="mb-4 text-[18px] font-bold">
          Awaiting review{pending.length > 0 && <span className="ml-2 text-ink-50">({pending.length})</span>}
        </h2>

        {pending.length === 0 ? (
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
                imagePath={rx.imagePath}
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
                    {rx.profile.fullName ?? rx.profile.email} &middot;{" "}
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
