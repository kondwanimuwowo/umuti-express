"use client";

import { useState, useTransition } from "react";
import { signUp } from "@/lib/actions/account";
import { AuthField } from "@/components/AuthField";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-7 flex flex-col gap-4"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          setNotice(null);
          const res = await signUp(formData);
          if (!res) return;
          if (res.ok) setNotice(res.message ?? null);
          else setError(res.error);
        })
      }
    >
      <AuthField label="Full name" name="fullName" autoComplete="name" required />
      <AuthField label="Email" name="email" type="email" autoComplete="email" required />
      <AuthField
        label="Mobile number"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="0977123456"
        required
      />
      <AuthField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters"
        required
      />

      {error && (
        <p role="alert" className="rounded-inner bg-[#fbe4e4] px-4 py-3 text-[13.5px] font-semibold text-[#9b2c2c]">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-inner bg-green-tint px-4 py-3 text-[13.5px] font-semibold text-green-dark">
          {notice}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-lg mt-1 w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
