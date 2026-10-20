import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/staff";
import { prisma } from "@/lib/prisma";
import { logAccess } from "@/lib/audit";
import { PrintButton } from "./PrintButton";

export const metadata = { title: "Rider label | Umuti Express" };

/**
 * The slip a rider carries. It holds only what is needed to reach the customer: the order code,
 * a first name, a phone number and the address. No medicine names and no prescription details,
 * so a lost or glimpsed slip says nothing about the customer's health.
 */
export default async function RiderLabelPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { profile, pharmacy } = await requireStaff(`/dashboard/orders/${code}/label`);

  // Scoped to this pharmacy: another pharmacy's order reads as not found.
  const order = await prisma.order.findFirst({
    where: { code, pharmacyId: pharmacy.id, fulfilment: "DELIVERY" },
    select: { id: true, code: true, phone: true, address: true, profile: { select: { fullName: true } } },
  });
  if (!order || !order.address) notFound();

  await logAccess(profile.id, "order.label", "Order", order.id);

  const firstName = order.profile.fullName?.trim().split(/\s+/)[0] ?? "Customer";

  return (
    <div className="max-w-[460px]">
      <div className="mb-5 flex items-center justify-between gap-3 print:hidden">
        <Link href="/dashboard/orders" className="text-[13.5px] font-semibold text-ink-62 no-underline hover:text-ink">
          Back to orders
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-card border-2 border-ink bg-white p-7 print:rounded-none print:shadow-none">
        <div className="text-[12px] font-bold tracking-wider text-ink-55 uppercase">Delivery from {pharmacy.name}</div>
        <div className="mt-2 font-display text-[44px] leading-none font-bold">{order.code}</div>

        <dl className="mt-7 flex flex-col gap-5">
          <div>
            <dt className="text-[11.5px] font-bold tracking-wider text-ink-55 uppercase">Deliver to</dt>
            <dd className="mt-1 text-[22px] font-bold">{firstName}</dd>
          </div>
          <div>
            <dt className="text-[11.5px] font-bold tracking-wider text-ink-55 uppercase">Phone</dt>
            <dd className="mt-1 text-[22px] font-bold">{order.phone}</dd>
          </div>
          <div>
            <dt className="text-[11.5px] font-bold tracking-wider text-ink-55 uppercase">Address</dt>
            <dd className="mt-1 text-[18px] leading-snug whitespace-pre-line">{order.address}</dd>
          </div>
        </dl>

        <p className="mt-8 border-t border-black/15 pt-4 text-[12px] text-ink-55">
          Private parcel. Please hand it only to the person named above.
        </p>
      </div>
    </div>
  );
}
