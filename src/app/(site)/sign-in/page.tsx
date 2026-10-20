import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { SignInForm } from "./SignInForm";

export const metadata = { title: "Sign in | Umuti Express" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getProfile()) redirect(next?.startsWith("/") ? next : "/account");

  return (
    <div className="shell-container max-w-[420px] py-16">
      <h1 className="font-display text-[26px] font-bold">Sign in</h1>
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-62">
        Sign in to order, upload a prescription and track deliveries.
      </p>

      <SignInForm next={next} />

      <p className="mt-6 text-center text-[13.5px] text-ink-62">
        No account yet?{" "}
        <Link href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"} className="font-bold text-green-dark">
          Create one
        </Link>
      </p>
    </div>
  );
}
