import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { SignUpForm } from "./SignUpForm";

export const metadata = { title: "Create an account | Umuti Express" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getProfile()) redirect("/account");

  return (
    <div className="shell-container max-w-[420px] py-16">
      <h1 className="font-display text-[26px] font-bold">Create an account</h1>
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-62">
        We use your mobile number for delivery updates and mobile money payments.
      </p>

      <SignUpForm />

      <p className="mt-6 text-center text-[13.5px] text-ink-62">
        Already have an account?{" "}
        <Link href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"} className="font-bold text-green-dark">
          Sign in
        </Link>
      </p>
    </div>
  );
}
