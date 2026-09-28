import { Suspense } from "react";
import { ShopView } from "./ShopView";

export const metadata = { title: "Shop medicines | Umuti Express" };

export default function ShopPage() {
  return (
    <Suspense>
      <ShopView />
    </Suspense>
  );
}
