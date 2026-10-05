"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPreferredPharmacy } from "@/lib/actions/pharmacies";
import { useToast } from "./Toast";

export function SelectPharmacyButton({ pharmacyId, selected }: { pharmacyId: string; selected: boolean }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={pending}
      className={`btn shrink-0 ${selected ? "btn-primary" : "btn-secondary"}`}
      onClick={() =>
        startTransition(async () => {
          const res = await setPreferredPharmacy({ pharmacyId });
          if (res.ok) toast(res.message);
          else toast(res.error, "error");
          router.refresh();
        })
      }
    >
      {pending ? "Saving…" : selected ? "Selected" : "Select for pickup"}
    </button>
  );
}
