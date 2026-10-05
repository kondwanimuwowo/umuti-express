"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { reorder } from "@/lib/actions/cart";
import { useToast } from "./Toast";

export function ReorderButton({ orderCode }: { orderCode: string }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn btn-primary !px-5 !py-2.5 !text-[13px]"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await reorder({ orderCode });
          if (res.ok) {
            toast(res.message);
            router.push("/cart");
          } else {
            toast(res.error, "error");
          }
        })
      }
    >
      {pending ? "Adding…" : "Reorder"}
    </button>
  );
}
