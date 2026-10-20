"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getPrescriptionUrl, reviewPrescription } from "@/lib/actions/prescriptions";
import { useToast } from "@/components/Toast";

export function ReviewCard({
  id,
  productId,
  productName,
  patientName,
  patientPhone,
  orderCode,
  isPdf,
  uploadedAt,
}: {
  id: string;
  productId: number;
  productName: string;
  patientName: string;
  patientPhone: string | null;
  orderCode: string;
  isPdf: boolean;
  uploadedAt: string;
}) {
  const [note, setNote] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const loadScan = () =>
    startTransition(async () => {
      const signed = await getPrescriptionUrl(id);
      if (signed) setUrl(signed);
      else toast("Could not open that scan.", "error");
    });

  const decide = (decision: "APPROVED" | "REJECTED") =>
    startTransition(async () => {
      const res = await reviewPrescription({ id, decision, note });
      if (res.ok) {
        toast(res.message);
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });

  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/product/${productId}`}
            className="font-display text-[17px] font-bold text-ink no-underline hover:underline"
          >
            {productName}
          </Link>
          <div className="mt-1 text-[13.5px] text-ink-62">
            {patientName}
            {patientPhone && ` · ${patientPhone}`}
          </div>
          <div className="text-[12.5px] text-ink-50">
            Order {orderCode} &middot; uploaded {uploadedAt}
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-amber-tint px-3 py-1.5 text-[12px] font-bold text-amber">
          Awaiting review
        </span>
      </div>

      <div className="mt-5">
        {url ? (
          isPdf ? (
            <a href={url} target="_blank" rel="noreferrer" className="btn btn-secondary">
              Open prescription PDF
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={`Prescription for ${productName}`}
              className="max-h-[420px] w-full rounded-inner bg-surface object-contain"
            />
          )
        ) : (
          <button type="button" className="btn btn-secondary" disabled={pending} onClick={loadScan}>
            {pending ? "Opening…" : "View prescription"}
          </button>
        )}
      </div>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-[13px] font-bold text-ink-70">
          Note to the patient <span className="font-normal text-ink-50">(required when not approving)</span>
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="e.g. The prescription is expired, please upload a current one."
          className="w-full resize-y rounded-inner bg-surface px-4 py-3 text-[14px] text-ink outline-none placeholder:text-ink-40 focus:ring-2 focus:ring-green"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" disabled={pending} onClick={() => decide("APPROVED")}>
          Approve
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={pending || !note.trim()}
          onClick={() => decide("REJECTED")}
        >
          Not approved
        </button>
      </div>
    </div>
  );
}
