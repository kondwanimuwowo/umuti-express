"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptPartnerAgreement } from "@/lib/actions/partner";
import { useToast } from "@/components/Toast";

export function AcceptAgreement() {
  const [agreed, setAgreed] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <div className="mt-5">
      <label className="flex items-start gap-3 text-[13.5px] leading-relaxed text-ink-70">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-green)]"
        />
        <span>I am authorised to act for this pharmacy and accept this version of the agreement on its behalf.</span>
      </label>
      <button
        type="button"
        className="btn btn-primary mt-4"
        disabled={pending || !agreed}
        onClick={() =>
          startTransition(async () => {
            const res = await acceptPartnerAgreement();
            if (res.ok) {
              toast(res.message ?? "Agreement accepted");
              router.refresh();
            } else {
              toast(res.error, "error");
            }
          })
        }
      >
        {pending ? "Saving…" : "Accept agreement"}
      </button>
    </div>
  );
}
