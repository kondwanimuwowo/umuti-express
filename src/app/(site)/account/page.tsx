import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getOrders, getPrescriptions } from "@/lib/queries";
import { ORDER_STATUS_LABEL, RX_STATUS_LABEL, fmtDate, fmtK } from "@/lib/format";
import { ReorderButton } from "@/components/ReorderButton";
import { ProfileForm } from "./ProfileForm";
import { SignOutButton } from "@/components/SignOutButton";
import { UserIcon } from "@/components/icons";

export const metadata = { title: "Your account | Umuti Express" };

export default async function AccountPage() {
  const profile = await requireProfile("/account");
  const [orders, prescriptions] = await Promise.all([
    getOrders(profile.id),
    getPrescriptions(profile.id),
  ]);

  return (
    <div className="shell-container max-w-[900px] py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[28px] font-bold">Your account</h1>
        <SignOutButton />
      </div>

      <div className="mt-7 flex items-center gap-4 rounded-card bg-white px-7 py-6 shadow-card">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-navy text-white">
          <UserIcon size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-[16px] font-bold">{profile.fullName ?? profile.email}</div>
          <div className="text-[13.5px] text-ink-55">
            {[profile.phone, profile.address].filter(Boolean).join(" · ") || profile.email}
          </div>
          {profile.pharmacyId || profile.role === "ADMIN" ? (
            <Link
              href="/dashboard"
              className="mt-2 inline-block rounded-full bg-green-tint px-2.5 py-1 text-[11.5px] font-bold text-green-dark no-underline"
            >
              Open dashboard
            </Link>
          ) : (
            <Link href="/partner/apply" className="mt-2 inline-block text-[12.5px] font-semibold text-ink-55 hover:text-ink">
              Own a pharmacy? List it on Umuti Express
            </Link>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-[18px] font-bold">Your details</h2>
        <ProfileForm
          fullName={profile.fullName ?? ""}
          phone={profile.phone ?? ""}
          address={profile.address ?? ""}
        />
      </section>

      {prescriptions.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-[18px] font-bold">Prescriptions</h2>
          <ul className="flex flex-col gap-2">
            {prescriptions.map((rx) => (
              <li
                key={rx.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-inner bg-white px-4 py-3 shadow-nav"
              >
                <div className="min-w-0">
                  <Link
                    href={`/prescription/${rx.productId}`}
                    className="text-[14px] font-bold text-ink no-underline hover:underline"
                  >
                    {rx.product.name}
                  </Link>
                  <div className="text-[12.5px] text-ink-50">Uploaded {fmtDate(rx.createdAt)}</div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold ${
                    rx.status === "APPROVED"
                      ? "bg-green-tint text-green-dark"
                      : rx.status === "REJECTED"
                        ? "bg-[#fbe4e4] text-[#9b2c2c]"
                        : "bg-amber-tint text-amber"
                  }`}
                >
                  {RX_STATUS_LABEL[rx.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <h2 className="mb-4 text-[18px] font-bold">Order history</h2>

        {orders.length === 0 ? (
          <div className="rounded-card bg-white p-8 text-center shadow-card">
            <p className="mb-5 text-[15px] text-ink-55">You have not placed an order yet.</p>
            <Link href="/shop" className="btn btn-primary">
              Browse medicines
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((o) => {
              const done = o.status === "COMPLETED";
              const method =
                o.fulfilment === "DELIVERY" ? "Home delivery" : `Pickup at ${o.pharmacy?.name ?? "pharmacy"}`;

              return (
                <div key={o.id} className="rounded-card bg-white px-6 py-5 shadow-card">
                  <div className="mb-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[15px] font-bold">Order {o.code}</div>
                      <div className="text-[12.5px] text-ink-50">
                        {fmtDate(o.createdAt)} &middot; {method}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold ${
                        done ? "bg-green-tint text-green-dark" : "bg-amber-tint text-amber"
                      }`}
                    >
                      {ORDER_STATUS_LABEL[o.status]}
                    </span>
                  </div>

                  <p className="mb-4 text-[13.5px] text-ink-62">
                    {o.items.map((it) => `${it.qty} × ${it.nameAtPurchase}`).join(", ")}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-[15px] font-bold text-green-dark">{fmtK(o.totalNgwee)}</span>
                    <div className="flex gap-2.5">
                      <Link href={`/track?code=${o.code}`} className="btn btn-secondary !px-5 !py-2.5 !text-[13px]">
                        Track
                      </Link>
                      <ReorderButton orderCode={o.code} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
