import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getLatestOrder, getOrder } from "@/lib/queries";
import { DELIVERY_STAGES, PICKUP_STAGES, fmtDate, fmtTime } from "@/lib/format";
import { CheckIcon } from "@/components/icons";
import type { OrderStatus } from "@/generated/prisma";

export const metadata = { title: "Track your order | Umuti Express" };

const COPY: Record<OrderStatus, { label: string; sub: string }> = {
  AWAITING_PAYMENT: { label: "Awaiting payment", sub: "We are confirming your mobile money payment" },
  PREPARING: { label: "Preparing your order", sub: "The pharmacy is packing your items" },
  READY: { label: "Ready for pickup", sub: "Head to the pharmacy counter" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", sub: "A rider is on the way" },
  COMPLETED: { label: "Completed", sub: "Order received" },
  CANCELLED: { label: "Cancelled", sub: "This order was cancelled" },
};

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const profile = await requireProfile("/track");
  const order = code ? await getOrder(profile.id, code) : await getLatestOrder(profile.id);

  if (!order) {
    return (
      <div className="shell-container max-w-[760px] py-14">
        <h1 className="font-display text-[28px] font-bold">Track your order</h1>
        <p className="mt-5 mb-7 text-[15px] text-ink-55">You have no orders yet.</p>
        <Link href="/shop" className="btn btn-primary">
          Browse medicines
        </Link>
      </div>
    );
  }

  const stages: readonly OrderStatus[] = order.fulfilment === "DELIVERY" ? DELIVERY_STAGES : PICKUP_STAGES;
  const current = stages.indexOf(order.status);
  const method =
    order.fulfilment === "DELIVERY" ? "Home delivery" : `Pickup at ${order.pharmacy?.name ?? "pharmacy"}`;

  // When each stage was reached, so the timeline shows real timestamps.
  const reachedAt = new Map(order.events.map((e) => [e.status, e.createdAt]));

  return (
    <div className="shell-container max-w-[760px] py-12">
      <h1 className="font-display text-[28px] font-bold">Track your order</h1>
      <p className="mt-2 text-[14.5px] text-ink-55">
        Order {order.code} &middot; {method} &middot; placed {fmtDate(order.createdAt)}
      </p>

      <ol className="mt-9 list-none p-0">
        {stages.map((stage, i) => {
          const done = current >= i;
          const at = reachedAt.get(stage);
          return (
            <li key={stage} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-colors ${
                    done ? "bg-green" : "bg-surface"
                  }`}
                >
                  {done && <CheckIcon size={16} />}
                </div>
                {i < stages.length - 1 && (
                  <div className={`min-h-9 w-0.5 flex-1 ${current > i ? "bg-green" : "bg-surface"}`} />
                )}
              </div>

              <div className="pb-9">
                <div className={`text-[15px] font-bold ${done ? "text-ink" : "text-ink-40"}`}>
                  {COPY[stage].label}
                </div>
                <div className="mt-1 text-[13px] text-ink-50">{COPY[stage].sub}</div>
                {at && <div className="mt-1 text-[12px] text-ink-40">{fmtDate(at)} at {fmtTime(at)}</div>}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Advancing an order is a staff action, not something the customer can do. */}
    </div>
  );
}
