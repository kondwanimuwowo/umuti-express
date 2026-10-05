"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { advanceOrder } from "@/lib/actions/orders";
import { useToast } from "./Toast";

export function AdvanceOrderButton({ code }: { code: string }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn btn-secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await advanceOrder({ code });
          if (!res.ok) toast(res.error, "error");
          router.refresh();
        })
      }
    >
      {pending ? "Updating…" : "Move to next stage"}
    </button>
  );
}
