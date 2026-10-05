"use client";

import { useState, useTransition } from "react";
import { signIn } from "@/lib/actions/account";
import { AuthField } from "@/components/AuthField";

export function SignInForm({ next }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-7 flex flex-col gap-4"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          // A success redirects, so only a failure returns here.
          const res = await signIn(formData);
          if (res && !res.ok) setError(res.error);
        })
      }
    >
      {next && <input type="hidden" name="next" value={next} />}

      <AuthField label="Email" name="email" type="email" autoComplete="email" required />
      <AuthField label="Password" name="password" type="password" autoComplete="current-password" required />

      {error && (
        <p role="alert" className="rounded-inner bg-[#fbe4e4] px-4 py-3 text-[13.5px] font-semibold text-[#9b2c2c]">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-lg mt-1 w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
