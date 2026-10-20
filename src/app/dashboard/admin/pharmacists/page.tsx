import { requireAdmin } from "@/lib/staff";
import { getPendingPharmacists } from "@/lib/queries";
import { PharmacistCard } from "./PharmacistCard";

export const metadata = { title: "Pharmacists | Umuti Express" };

export default async function PharmacistsPage() {
  await requireAdmin("/dashboard/admin/pharmacists");
  const pending = await getPendingPharmacists();

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[28px] font-bold">Pharmacists</h1>
      <p className="mt-2.5 text-[14.5px] text-ink-62">
        {pending.length > 0 ? `${pending.length} awaiting verification.` : "No applications waiting."} Check the licence and the
        expiry date on the certificate before verifying. Verification lapses when the certificate does.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        {pending.map((p) => (
          <PharmacistCard
            key={p.id}
            id={p.id}
            name={p.profile.fullName ?? p.profile.email}
            email={p.profile.email}
            pharmacy={p.profile.pharmacy?.name ?? null}
            registrationNumber={p.registrationNumber}
            documents={p.documents
              .filter((d) => d.status === "PENDING")
              .map((d) => ({ type: d.type, filePath: d.filePath, expiresOn: d.expiresOn?.toISOString().slice(0, 10) ?? null }))}
          />
        ))}
      </div>
    </div>
  );
}
