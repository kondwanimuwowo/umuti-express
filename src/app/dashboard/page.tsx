import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Dashboard | Umuti Express" };

export default async function DashboardPage() {
  const profile = await requireProfile("/dashboard");

  const pharmacy = profile.pharmacyId
    ? await prisma.pharmacy.findUnique({ where: { id: profile.pharmacyId } })
    : null;

  if (!pharmacy) redirect(profile.role === "ADMIN" ? "/dashboard/admin" : "/partner/apply");
  if (pharmacy.status === "ACTIVE") redirect("/dashboard/orders");

  const suspended = pharmacy.status === "SUSPENDED";

  return (
    <div className="mx-auto max-w-[560px] py-10 text-center">
      <h1 className="font-display text-[28px] font-bold">
        {suspended ? "Application not approved" : "Application under review"}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-62">
        {suspended
          ? `${pharmacy.name} is not currently listed.`
          : `${pharmacy.name} is waiting for our team to check your documents. You will get access to your dashboard once it is approved.`}
      </p>
      {pharmacy.reviewNote && (
        <p className="mt-4 rounded-inner bg-amber-tint px-4 py-3 text-[14px] text-amber">
          Note from our team: {pharmacy.reviewNote}
        </p>
      )}
      {profile.role === "ADMIN" && (
        <Link href="/dashboard/admin" className="btn btn-secondary mt-7">
          Admin
        </Link>
      )}
    </div>
  );
}
