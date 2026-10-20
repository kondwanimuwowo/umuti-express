"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinPharmacy } from "@/lib/actions/partner";
import { useToast } from "@/components/Toast";

export function JoinButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn btn-primary btn-lg mt-7"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await joinPharmacy({ token });
          if (res.ok) {
            toast(res.message ?? "Joined");
            router.push("/dashboard");
          } else {
            toast(res.error, "error");
          }
        })
      }
    >
      {pending ? "Joining…" : "Join pharmacy"}
    </button>
  );
}
