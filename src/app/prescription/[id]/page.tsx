import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/queries";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtDate, RX_STATUS_LABEL } from "@/lib/format";
import { PrescriptionUpload } from "@/components/PrescriptionUpload";
import { CheckIcon, ClockIcon } from "@/components/icons";

export const metadata = { title: "Upload your prescription | Umuti Express" };

export default async function PrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const product = await getProduct(id);
  if (product?.classification !== "PRESCRIPTION") notFound();

  const profile = await requireProfile(`/prescription/${id}`);
  const history = await prisma.prescription.findMany({
    where: { profileId: profile.id, productId: id },
    orderBy: { createdAt: "desc" },
    include: { reviewer: { select: { fullName: true } } },
  });

  const latest = history[0] ?? null;
  const approved = latest !== null && latest.status === "APPROVED";
  const pending = latest !== null && latest.status === "PENDING";

  return (
    <div className="shell-container max-w-[640px] py-14">
      <h1 className="font-display text-[28px] font-bold">Upload your prescription</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-62">
        A licensed pharmacist reviews your prescription for <strong className="font-bold">{product.name}</strong> before
        it can be ordered.
      </p>

      {latest !== null && latest.status === "APPROVED" && (
        <>
          <StatusCard
            tone="green"
            icon={<CheckIcon size={20} />}
            title="Prescription approved"
            sub={`${latest.reviewer?.fullName ?? "A pharmacist"} confirmed your prescription on ${fmtDate(latest.reviewedAt ?? latest.createdAt)}`}
          />
          <Link href={`/product/${product.id}`} className="btn btn-primary btn-lg mt-6 w-full">
            Back to {product.name}
          </Link>
        </>
      )}

      {latest !== null && latest.status === "PENDING" && (
        <StatusCard
          tone="amber"
          icon={<ClockIcon />}
          title="A pharmacist is reviewing your prescription"
          sub={`Uploaded ${fmtDate(latest.createdAt)}. We'll update this page once it's been checked.`}
        />
      )}

      {!approved && !pending && (
        <>
          {latest !== null && latest.status === "REJECTED" && (
            <StatusCard
              tone="amber"
              icon={<ClockIcon />}
              title="Your last prescription was not approved"
              sub={latest.note ?? "Please upload a clearer or more recent prescription."}
            />
          )}
          <div className="mt-6">
            <PrescriptionUpload productId={product.id} />
          </div>
        </>
      )}

      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 font-display text-[15px] font-bold">Upload history</h2>
          <ul className="flex flex-col gap-2">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between gap-4 rounded-inner bg-white px-4 py-3 text-[13.5px] shadow-nav"
              >
                <span className="text-ink-62">{fmtDate(h.createdAt)}</span>
                <span
                  className={`font-bold ${
                    h.status === "APPROVED" ? "text-green-dark" : h.status === "REJECTED" ? "text-[#9b2c2c]" : "text-amber"
                  }`}
                >
                  {RX_STATUS_LABEL[h.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatusCard({
  tone,
  icon,
  title,
  sub,
}: {
  tone: "green" | "amber";
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div
      role="status"
      className={`mt-7 flex items-center gap-4 rounded-card p-7 ${tone === "green" ? "bg-green-tint" : "bg-amber-tint"}`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-nav ${
          tone === "green" ? "text-green-dark" : "text-amber"
        }`}
      >
        {icon}
      </div>
      <div>
        <div className="text-[14.5px] font-bold">{title}</div>
        <div className="mt-0.5 text-[13px] text-ink-55">{sub}</div>
      </div>
    </div>
  );
}
