"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDocumentUrl, reviewPharmacy } from "@/lib/actions/admin";
import { useToast } from "@/components/Toast";

const STATUS_STYLE = {
  PENDING: "bg-amber-tint text-amber",
  ACTIVE: "bg-green-tint text-green-dark",
  SUSPENDED: "bg-[#fbe4e4] text-[#9b2c2c]",
} as const;

const DOC_LABEL: Record<string, string> = {
  PHARMACY_REGISTRATION: "Registration certificate",
  BUSINESS_LICENCE: "Business licence",
  LICENCE: "Licence",
  PRACTISING_CERTIFICATE: "Practising certificate",
};

type Props = {
  id: string;
  name: string;
  area: string;
  address: string | null;
  phone: string | null;
  hours: string;
  status: keyof typeof STATUS_STYLE;
  reviewNote: string | null;
  lat: number;
  lng: number;
  owner: { fullName: string | null; email: string; phone: string | null } | null;
  documents: { type: string; filePath: string }[];
};

export function AdminPharmacyCard(p: Props) {
  const [lat, setLat] = useState(String(p.lat));
  const [lng, setLng] = useState(String(p.lng));
  const [note, setNote] = useState(p.reviewNote ?? "");
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const openDocument = (path: string) =>
    startTransition(async () => {
      const url = await getDocumentUrl(path);
      if (url) window.open(url, "_blank", "noopener");
      else toast("Could not open that document.", "error");
    });

  const decide = (decision: "ACTIVE" | "SUSPENDED") =>
    startTransition(async () => {
      const res = await reviewPharmacy({ id: p.id, decision, note, lat: Number(lat), lng: Number(lng) });
      if (res.ok) {
        toast(res.message);
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });

  return (
    <section className="rounded-card bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-[17px] font-bold">{p.name}</h2>
          <div className="mt-1 text-[13.5px] text-ink-62">
            {[p.area, p.address, p.phone, p.hours].filter(Boolean).join(" · ")}
          </div>
          {p.owner && (
            <div className="mt-0.5 text-[12.5px] text-ink-50">
              Owner: {p.owner.fullName ?? p.owner.email}
              {p.owner.phone && ` · ${p.owner.phone}`}
            </div>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold ${STATUS_STYLE[p.status]}`}>
          {p.status === "PENDING" ? "Awaiting review" : p.status === "ACTIVE" ? "Active" : "Suspended"}
        </span>
      </div>

      {p.documents.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {p.documents.map((d) => (
            <button
              key={d.filePath}
              type="button"
              className="btn btn-secondary !px-4 !py-2 !text-[13px]"
              disabled={pending}
              onClick={() => openDocument(d.filePath)}
            >
              {DOC_LABEL[d.type] ?? d.type}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-bold text-ink-70">Latitude</span>
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-inner bg-surface px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-green"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-bold text-ink-70">Longitude</span>
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-inner bg-surface px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-green"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="mb-1.5 block text-[12.5px] font-bold text-ink-70">
          Note <span className="font-normal text-ink-50">(required to suspend or reject)</span>
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full resize-y rounded-inner bg-surface px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-green"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        {p.status !== "ACTIVE" && (
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => decide("ACTIVE")}>
            Activate
          </button>
        )}
        {p.status !== "SUSPENDED" && (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={pending || !note.trim()}
            onClick={() => decide("SUSPENDED")}
          >
            {p.status === "PENDING" ? "Reject" : "Suspend"}
          </button>
        )}
      </div>
    </section>
  );
}
