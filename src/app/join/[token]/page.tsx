import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JoinButton } from "./JoinButton";

export const metadata = { title: "Join a pharmacy | Umuti Express" };

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const profile = await requireProfile(`/join/${token}`);

  const invite = await prisma.pharmacyInvite.findUnique({ where: { token }, include: { pharmacy: true } });
  const valid = invite && !invite.usedAt && invite.expiresAt > new Date() && invite.pharmacy.status === "ACTIVE";

  return (
    <div className="shell-container max-w-[520px] py-16 text-center">
      {valid ? (
        <>
          <h1 className="font-display text-[28px] font-bold">Join {invite.pharmacy.name}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-62">
            You will be able to manage this pharmacy&apos;s orders, prescriptions and chats as{" "}
            {profile.fullName ?? profile.email}. Only join if you work there.
          </p>
          <JoinButton token={token} />
        </>
      ) : (
        <>
          <h1 className="font-display text-[28px] font-bold">This invite isn&apos;t valid</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-62">
            It may have expired or already been used. Ask the pharmacy owner for a new link.
          </p>
          <Link href="/" className="btn btn-secondary mt-7">
            Back to home
          </Link>
        </>
      )}
    </div>
  );
}
