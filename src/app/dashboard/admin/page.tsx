import { requireAdmin } from "@/lib/staff";
import { prisma } from "@/lib/prisma";
import { AdminPharmacyCard } from "./AdminPharmacyCard";

export const metadata = { title: "Pharmacies | Umuti Express" };

const ORDER = { PENDING: 0, SUSPENDED: 1, ACTIVE: 2 } as const;

export default async function AdminPage() {
  await requireAdmin();

  const pharmacies = await prisma.pharmacy.findMany({
    include: {
      documents: { orderBy: { createdAt: "asc" } },
      pharmacists: { where: { isPharmacyOwner: true }, select: { fullName: true, email: true, phone: true } },
    },
  });
  pharmacies.sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.name.localeCompare(b.name));

  const pending = pharmacies.filter((p) => p.status === "PENDING").length;

  return (
    <div className="max-w-[860px]">
      <h1 className="font-display text-[28px] font-bold">Pharmacies</h1>
      <p className="mt-2.5 text-[14.5px] text-ink-62">
        {pending > 0 ? `${pending} awaiting review.` : "No applications waiting."} Check the registration documents
        before activating, and set the map location.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        {pharmacies.map((p) => (
          <AdminPharmacyCard
            key={p.id}
            id={p.id}
            name={p.name}
            area={p.area}
            address={p.address}
            phone={p.phone}
            hours={p.hours}
            status={p.status}
            reviewNote={p.reviewNote}
            lat={p.lat}
            lng={p.lng}
            owner={p.pharmacists[0] ?? null}
            documents={p.documents.map((d) => ({ type: d.type, filePath: d.filePath }))}
          />
        ))}
      </div>
    </div>
  );
}
