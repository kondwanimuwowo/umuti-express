import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "./DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile("/dashboard");
  const isAdmin = profile.role === "ADMIN";

  const pharmacy = profile.pharmacyId
    ? await prisma.pharmacy.findUnique({ where: { id: profile.pharmacyId } })
    : null;
  if (!pharmacy && !isAdmin) redirect("/partner/apply");

  const staffAccess = pharmacy?.status === "ACTIVE" && (profile.role === "PHARMACIST" || isAdmin);

  const links: { href: string; label: string }[] = [];
  if (staffAccess) {
    links.push(
      { href: "/dashboard/orders", label: "Orders" },
      { href: "/dashboard/prescriptions", label: "Prescriptions" },
      { href: "/dashboard/chats", label: "Chats" },
    );
    if (profile.isPharmacyOwner) links.push({ href: "/dashboard/settings", label: "Settings" });
  }
  if (isAdmin) links.push({ href: "/dashboard/admin", label: "Pharmacies" });

  // A pending or suspended pharmacy sees only its status page, with no navigation.
  if (links.length === 0) return <>{children}</>;

  return (
    <div className="shell-container grid gap-8 py-10 lg:grid-cols-[200px_1fr]">
      <aside>
        {pharmacy && <div className="mb-4 truncate font-display text-[15px] font-bold">{pharmacy.name}</div>}
        <DashboardNav links={links} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
