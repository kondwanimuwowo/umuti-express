import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getOrder } from "@/lib/queries";
import { fmtK } from "@/lib/format";
import { CheckIcon } from "@/components/icons";

export const metadata = { title: "Order placed | Umuti Express" };

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (!code) notFound();

  const profile = await requireProfile("/account");
  const order = await getOrder(profile.id, code);
  if (!order) notFound();

  const method =
    order.fulfilment === "DELIVERY" ? "Home delivery" : `Pickup at ${order.pharmacy?.name ?? "pharmacy"}`;

  return (
    <div className="shell-container max-w-[560px] py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-tint text-green-dark">
        <CheckIcon size={28} />
      </div>

      <h1 className="font-display text-[28px] font-bold">Order placed</h1>
      <p className="mt-3 text-[15px] text-ink-62">
        Order {order.code} &middot; {method}
      </p>
      <p className="mt-1 text-[15px] text-ink-62">
        {fmtK(order.totalNgwee)} paid by {order.paymentMethod === "MTN" ? "MTN Mobile Money" : "Airtel Money"}
      </p>
      <p className="mt-6 text-[15px] leading-relaxed text-ink-62">
        We will notify you on {order.phone} as soon as it is on the way.
      </p>

      <ul className="mt-8 flex flex-col gap-2 text-left">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-inner bg-white px-4 py-3 text-[13.5px] shadow-nav"
          >
            <span className="text-ink-70">
              {item.qty} &times; {item.nameAtPurchase}
            </span>
            <span className="font-bold">{fmtK(item.unitPriceNgwee * item.qty)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-9 flex flex-wrap justify-center gap-3.5">
        <Link href={`/track?code=${order.code}`} className="btn btn-primary btn-lg">
          Track order
        </Link>
        <Link href="/shop" className="btn btn-secondary btn-lg">
          Back to shop
        </Link>
      </div>
    </div>
  );
}
