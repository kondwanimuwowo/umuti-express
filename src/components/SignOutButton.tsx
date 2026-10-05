"use client";

import { useTransition } from "react";
import { signOut } from "@/lib/actions/account";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-secondary"
      disabled={pending}
      onClick={() => startTransition(async () => void (await signOut()))}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
