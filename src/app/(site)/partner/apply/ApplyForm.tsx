"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyAsPharmacy } from "@/lib/actions/partner";
import { PharmacyFields } from "@/components/PharmacyFields";
import { useToast } from "@/components/Toast";

export function ApplyForm() {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <form
      className="mt-8 flex flex-col gap-7"
      action={(formData) =>
        startTransition(async () => {
          const res = await applyAsPharmacy(formData);
          if (res.ok) {
            toast(res.message ?? "Application sent");
            router.push("/dashboard");
          } else {
            toast(res.error, "error");
          }
        })
      }
    >
      <section className="rounded-card bg-white p-7 shadow-card">
        <h2 className="mb-5 font-display text-[16px] font-bold">Pharmacy details</h2>
        <PharmacyFields />
      </section>

      <section className="rounded-card bg-white p-7 shadow-card">
        <h2 className="font-display text-[16px] font-bold">Documents</h2>
        <p className="mt-1 mb-5 text-[13.5px] text-ink-55">
          JPEG, PNG, WebP or PDF, up to 8MB each. Only our review team can open them.
        </p>
        <div className="flex flex-col gap-4">
          <FileField label="Pharmacy registration certificate" name="registration" />
          <FileField label="Business licence" name="licence" />
        </div>
      </section>

      <label className="flex items-start gap-3 rounded-card bg-white p-5 text-[13.5px] leading-relaxed text-ink-70 shadow-card">
        <input type="checkbox" name="acceptAgreement" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-green)]" />
        <span>
          I am authorised to act for this pharmacy and accept the{" "}
          <Link href="/legal/partner-agreement" target="_blank" className="font-bold text-green-dark">
            Pharmacy Partner Agreement
          </Link>{" "}
          on its behalf.
        </span>
      </label>

      <button type="submit" className="btn btn-primary btn-lg self-start" disabled={pending}>
        {pending ? "Sending…" : "Send application"}
      </button>
    </form>
  );
}

function FileField({ label, name }: { label: string; name: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-ink-70">{label}</span>
      <input
        type="file"
        name={name}
        required
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="block w-full text-[13.5px] text-ink-62 file:mr-4 file:rounded-full file:border-0 file:bg-green-tint file:px-4 file:py-2 file:text-[13px] file:font-bold file:text-green-dark"
      />
    </label>
  );
}
