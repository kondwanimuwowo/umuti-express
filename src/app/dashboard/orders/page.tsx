import Link from "next/link";
import { requireStaff } from "@/lib/staff";
import { getPharmacyOrderCounts, getPharmacyOrders, type OrderView } from "@/lib/queries";
import { DELIVERY_STAGES, ORDER_STATUS_LABEL, PICKUP_STAGES, fmtDate, fmtK, fmtTime } from "@/lib/format";
import { AdvanceOrderButton } from "@/components/AdvanceOrderButton";

export const metadata = { title: "Orders | Umuti Express" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { pharmacy } = await requireStaff("/dashboard/orders");
  const view: OrderView = (await searchParams).view === "done" ? "done" : "active";

  const [orders, counts] = await Promise.all([getPharmacyOrders(pharmacy.id, view), getPharmacyOrderCounts(pharmacy.id)]);

  return (
    <div>
      <h1 className="font-display text-[28px] font-bold">Orders</h1>

      <div className="mt-5 flex gap-2">
        <Tab href="/dashboard/orders" active={view === "active"}>
          Active ({counts.active})
        </Tab>
        <Tab href="/dashboard/orders?view=done" active={view === "done"}>
          Completed ({counts.done})
        </Tab>
      </div>

      {orders.length === 0 ? (
        <p className="mt-7 rounded-card bg-white p-8 text-center text-[15px] text-ink-55 shadow-card">
          {view === "active" ? "No orders to prepare right now." : "No completed orders yet."}
        </p>
      ) : (
        <ul className="mt-7 flex flex-col gap-4">
          {orders.map((o) => {
            const stages = o.fulfilment === "DELIVERY" ? DELIVERY_STAGES : PICKUP_STAGES;
            const last = o.status === stages[stages.length - 1];
            return (
              <li key={o.id} className="rounded-card bg-white p-6 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-display text-[16.5px] font-bold">{o.code}</div>
                    <div className="mt-0.5 text-[13px] text-ink-55">
                      {fmtDate(o.createdAt)} at {fmtTime(o.createdAt)} &middot;{" "}
                      {o.fulfilment === "DELIVERY" ? "Delivery" : "Pickup"}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-green-tint px-3 py-1.5 text-[12px] font-bold text-green-dark">
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                </div>

                <ul className="mt-4 flex flex-col gap-1 text-[14px] text-ink-70">
                  {o.items.map((i) => (
                    <li key={i.id}>
                      {i.qty} &times; {i.nameAtPurchase}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 grid gap-1 border-t border-black/[0.08] pt-4 text-[13.5px] text-ink-62 sm:grid-cols-2">
                  <div>
                    {o.profile.fullName ?? "Customer"} &middot; {o.phone}
                  </div>
                  {o.address && <div>{o.address}</div>}
                  <div>
                    {fmtK(o.totalNgwee)} &middot; {o.paymentStatus === "PAID" ? "Paid" : o.paymentStatus.toLowerCase()}
                  </div>
                </div>

                {view === "active" && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {!last && <AdvanceOrderButton code={o.code} />}
                    {o.fulfilment === "DELIVERY" && (
                      <Link href={`/dashboard/orders/${o.code}/label`} className="btn btn-secondary !px-4 !py-2 !text-[13px]">
                        Rider label
                      </Link>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`rounded-full px-4 py-2 text-[13.5px] font-semibold no-underline ${
        active ? "bg-green text-white" : "bg-white text-ink-70 shadow-nav hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
