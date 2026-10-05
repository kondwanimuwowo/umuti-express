import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getCart, getPharmacies } from "@/lib/queries";
import { CheckoutForm } from "./CheckoutForm";

export const metadata = { title: "Checkout | Umuti Express" };

export default async function CheckoutPage() {
  const profile = await requireProfile("/checkout");
  const [cart, pharmacies] = await Promise.all([getCart(profile.id), getPharmacies()]);

  if (cart.items.length === 0) {
    return (
      <div className="shell-container py-10 text-center">
        <h1 className="font-display text-[28px] font-bold">Checkout</h1>
        <p className="mt-6 mb-6 text-[16px] text-ink-55">Your cart is empty.</p>
        <Link href="/shop" className="btn btn-primary">
          Browse medicines
        </Link>
      </div>
    );
  }

  // Server-side guard: an unapproved Rx item must not reach the payment step.
  if (cart.blockedItems.length > 0) {
    return (
      <div className="shell-container max-w-[560px] py-14 text-center">
        <h1 className="font-display text-[28px] font-bold">Waiting on pharmacist approval</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-62">
          These items need an approved prescription before you can check out:{" "}
          {cart.blockedItems.map((i) => i.product.name).join(", ")}.
        </p>
        <Link href="/cart" className="btn btn-primary mt-7">
          Back to cart
        </Link>
      </div>
    );
  }

  return (
    <div className="shell-container py-10">
      <h1 className="font-display text-[28px] font-bold">Checkout</h1>
      <CheckoutForm
        items={cart.items.map((i) => ({
          productId: i.productId,
          name: i.product.name,
          qty: i.qty,
          priceNgwee: i.product.priceNgwee,
        }))}
        subtotalNgwee={cart.subtotalNgwee}
        pharmacies={pharmacies.map((p) => ({ id: p.id, name: p.name, area: p.area, hours: p.hours }))}
        defaultPhone={profile.phone ?? ""}
        defaultAddress={profile.address ?? ""}
        defaultPharmacyId={profile.preferredPharmacyId ?? ""}
      />
    </div>
  );
}
