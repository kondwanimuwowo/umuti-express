"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePharmacy } from "@/lib/actions/partner";
import { PharmacyFields, type PharmacyValues } from "@/components/PharmacyFields";
import { useToast } from "@/components/Toast";

export function SettingsForm({ defaults }: { defaults: PharmacyValues }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <form
      className="rounded-card bg-white p-6 shadow-card"
      action={(formData) =>
        startTransition(async () => {
          const text = (key: string) => String(formData.get(key) ?? "");
          const res = await updatePharmacy({
            name: text("name"),
            area: text("area"),
            address: text("address"),
            phone: text("phone"),
            hours: text("hours"),
            offersDelivery: formData.get("offersDelivery") === "on",
            deliveryNote: text("deliveryNote"),
          });
          if (res.ok) {
            toast(res.message ?? "Saved");
            router.refresh();
          } else {
            toast(res.error, "error");
          }
        })
      }
    >
      <PharmacyFields defaults={defaults} />
      <button type="submit" className="btn btn-primary mt-6" disabled={pending}>
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}
