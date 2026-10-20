import { requireOwner } from "@/lib/staff";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";
import { TeamPanel } from "./TeamPanel";

export const metadata = { title: "Settings | Umuti Express" };

export default async function SettingsPage() {
  const { profile, pharmacy } = await requireOwner("/dashboard/settings");

  const [members, invites] = await Promise.all([
    prisma.profile.findMany({
      where: { pharmacyId: pharmacy.id },
      orderBy: [{ isPharmacyOwner: "desc" }, { createdAt: "asc" }],
      select: { id: true, fullName: true, email: true, isPharmacyOwner: true },
    }),
    prisma.pharmacyInvite.findMany({
      where: { pharmacyId: pharmacy.id, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: { id: true, token: true, label: true, expiresAt: true },
    }),
  ]);

  return (
    <div className="max-w-[720px]">
      <h1 className="font-display text-[28px] font-bold">Settings</h1>

      <section className="mt-7">
        <h2 className="mb-4 text-[18px] font-bold">Pharmacy details</h2>
        <SettingsForm
          defaults={{
            name: pharmacy.name,
            area: pharmacy.area,
            address: pharmacy.address ?? "",
            phone: pharmacy.phone ?? "",
            hours: pharmacy.hours,
            offersDelivery: pharmacy.offersDelivery,
            deliveryNote: pharmacy.deliveryNote ?? "",
          }}
        />
      </section>

      <section className="mt-12">
        <h2 className="mb-1 text-[18px] font-bold">Team</h2>
        <p className="mb-4 text-[13.5px] text-ink-55">
          Staff can manage orders, prescriptions and chats. Only pharmacists should be given access to review
          prescriptions.
        </p>
        <TeamPanel
          selfId={profile.id}
          members={members}
          invites={invites.map((i) => ({ ...i, expiresAt: i.expiresAt.toISOString() }))}
        />
      </section>
    </div>
  );
}
