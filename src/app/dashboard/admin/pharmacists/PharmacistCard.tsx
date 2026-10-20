"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDocumentUrl } from "@/lib/actions/admin";
import { reviewPharmacist } from "@/lib/actions/verification";
import { useToast } from "@/components/Toast";

type Props = {
  id: string;
  name: string;
  email: string;
  pharmacy: string | null;
  registrationNumber: string | null;
  documents: { type: string; filePath: string; expiresOn: string | null }[];
};

const LABEL: Record<string, string> = { LICENCE: "Licence", PRACTISING_CERTIFICATE: "Practising certificate" };

export function PharmacistCard(p: Props) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const open = (path: string) =>
    startTransition(async () => {
      const url = await getDocumentUrl(path);
      if (url) window.open(url, "_blank", "noopener");
      else toast("Could not open that document.", "error");
    });

  const decide = (decision: "VERIFIED" | "REJECTED") =>
    startTransition(async () => {
      const res = await reviewPharmacist({ id: p.id, decision, note });
      if (res.ok) {
        toast(res.message);
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    });

  return (
    <section className="rounded-card bg-white p-6 shadow-card">
      <h2 className="font-display text-[17px] font-bold">{p.name}</h2>
      <div className="mt-1 text-[13.5px] text-ink-62">
        {p.email}
        {p.pharmacy && ` · ${p.pharmacy}`}
      </div>
      <div className="mt-0.5 text-[12.5px] text-ink-50">Registration number: {p.registrationNumber ?? "not given"}</div>

      <div className="mt-4 flex flex-wrap gap-2">
        {p.documents.map((d) => (
          <button key={d.filePath} type="button" className="btn btn-secondary !px-4 !py-2 !text-[13px]" disabled={pending} onClick={() => open(d.filePath)}>
            {LABEL[d.type] ?? d.type}
            {d.expiresOn && ` (expires ${d.expiresOn})`}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[12.5px] font-bold text-ink-70">
          Note <span className="font-normal text-ink-50">(required to reject)</span>
        </span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-inner bg-surface px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-green"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" disabled={pending} onClick={() => decide("VERIFIED")}>
          Verify
        </button>
        <button type="button" className="btn btn-secondary" disabled={pending || !note.trim()} onClick={() => decide("REJECTED")}>
          Reject
        </button>
      </div>
    </section>
  );
}
