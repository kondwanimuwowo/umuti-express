"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/actions/cart";
import { useToast } from "./Toast";

/**
 * Adds a listing to the cart. When the cart already holds another pharmacy's items the first
 * attempt is refused; `needsSwitch` then turns true and the next call clears the old cart.
 */
export function useAddToCart(productId: number, pharmacyId: string) {
  const [pending, startTransition] = useTransition();
  const [needsSwitch, setNeedsSwitch] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const add = (qty = 1) =>
    startTransition(async () => {
      const res = await addToCart({ productId, pharmacyId, qty, replace: needsSwitch });
      if (res.ok) {
        setNeedsSwitch(false);
        toast(res.message);
        router.refresh();
        return;
      }
      if (res.code === "OTHER_PHARMACY") setNeedsSwitch(true);
      toast(res.error, "error");
    });

  return { add, pending, needsSwitch };
}
