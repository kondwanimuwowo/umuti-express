import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { ApplyForm } from "./ApplyForm";

export const metadata = { title: "List your pharmacy | Umuti Express" };

export default async function ApplyPage() {
  const profile = await requireProfile("/partner/apply");

  if (profile.pharmacyId) {
    return (
      <div className="shell-container max-w-[560px] py-16 text-center">
        <h1 className="font-display text-[28px] font-bold">Your account is linked to a pharmacy</h1>
        <Link href="/dashboard" className="btn btn-primary mt-7">
          Open dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="shell-container max-w-[680px] py-12">
      <h1 className="font-display text-[28px] font-bold">List your pharmacy</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-62">
        Apply to list your pharmacy on Umuti Express. We check your registration documents before it is
        published. You will be the pharmacy&apos;s owner and can invite your staff afterwards.
      </p>
      <ApplyForm />
    </div>
  );
}
