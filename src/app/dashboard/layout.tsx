import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStaffCounts } from "@/lib/queries";
import { DashboardShell, type NavSection } from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile("/dashboard");
  const isAdmin = profile.role === "ADMIN";

  const pharmacy = profile.pharmacyId
    ? await prisma.pharmacy.findUnique({ where: { id: profile.pharmacyId } })
    : null;
  if (!pharmacy && !isAdmin) redirect("/partner/apply");

  const staffAccess = pharmacy?.status === "ACTIVE" && (profile.role === "PHARMACIST" || isAdmin);
  const counts = staffAccess && pharmacy ? await getStaffCounts(pharmacy.id) : null;

  // A pending or suspended pharmacy gets the shell with no navigation, only its status page.
  const sections: NavSection[] = [];
  if (staffAccess) {
    const links: NavSection["links"] = [
      { href: "/dashboard/orders", label: "Orders", icon: "orders", count: counts?.orders },
      { href: "/dashboard/products", label: "Products", icon: "products" },
      { href: "/dashboard/prescriptions", label: "Prescriptions", icon: "prescriptions", count: counts?.prescriptions },
      { href: "/dashboard/chats", label: "Chats", icon: "chats", count: counts?.chats },
      { href: "/dashboard/verification", label: "Verification", icon: "verification" },
    ];
    sections.push({ title: "Pharmacy", links });
  }
  if (isAdmin) {
    const [pendingPharmacies, pendingProducts, pendingPharmacists] = await Promise.all([
      prisma.pharmacy.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "PENDING" } }),
      prisma.pharmacistProfile.count({ where: { status: "PENDING" } }),
    ]);
    sections.push({
      title: "Platform",
      links: [
        { href: "/dashboard/admin/catalogue", label: "Catalogue", icon: "catalogue", count: pendingProducts },
        { href: "/dashboard/admin/pharmacists", label: "Pharmacists", icon: "pharmacists", count: pendingPharmacists },
        { href: "/dashboard/admin", label: "Pharmacies", icon: "pharmacies", count: pendingPharmacies },
      ],
    });
  }

  const roleLabel = isAdmin ? "Admin" : profile.isPharmacyOwner ? "Owner" : "Pharmacist";

  return (
    <DashboardShell
      sections={sections}
      settingsHref={staffAccess && profile.isPharmacyOwner ? "/dashboard/settings" : undefined}
      pharmacyName={pharmacy?.name ?? null}
      roleLabel={roleLabel}
      user={{ name: profile.fullName ?? profile.email, email: profile.email }}
    >
      {children}
    </DashboardShell>
  );
}
