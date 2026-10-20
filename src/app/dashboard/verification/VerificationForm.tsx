"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitVerification } from "@/lib/actions/verification";
import { Field } from "@/components/PharmacyFields";
import { useToast } from "@/components/Toast";

const fileInput =
  "block w-full rounded-inner bg-surface px-4 py-3 text-[14px] text-ink file:mr-4 file:rounded-full file:border-0 file:bg-green-tint file:px-4 file:py-2 file:text-[13px] file:font-bold file:text-green-dark";

export function VerificationForm({ defaultRegistration }: { defaultRegistration: string }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <form
      className="rounded-card bg-white p-6 shadow-card"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await submitVerification(data);
          if (res.ok) {
            toast(res.message);
            router.refresh();
          } else {
            toast(res.error, "error");
          }
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Registration number" name="registrationNumber" defaultValue={defaultRegistration} hint="As issued by your professional body" required />
        <Field label="Practising certificate expires on" name="certificateExpiry" type="date" required />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-ink-70">Licence</span>
          <input type="file" name="licence" required accept="image/jpeg,image/png,image/webp,application/pdf" className={fileInput} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-ink-70">Current practising certificate</span>
          <input type="file" name="certificate" required accept="image/jpeg,image/png,image/webp,application/pdf" className={fileInput} />
        </label>
      </div>
      <p className="mt-3 text-[12.5px] text-ink-50">JPEG, PNG, WebP or PDF, up to 8MB each. Only our verification team can open them.</p>
      <button type="submit" className="btn btn-primary mt-5" disabled={pending}>
        {pending ? "Sending…" : "Submit for review"}
      </button>
    </form>
  );
}
