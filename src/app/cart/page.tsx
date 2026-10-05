import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getCart } from "@/lib/queries";
import { DELIVERY_FEE_NGWEE, fmtK } from "@/lib/format";
import { ImageSlot } from "@/components/ImageSlot";
import { OrderSummary } from "@/components/OrderSummary";
import { CartRowControls } from "@/components/CartRowControls";

export const metadata = { title: "Your cart | Umuti Express" };

export default async function CartPage() {
  const profile = await requireProfile("/cart");
  const cart = await getCart(profile.id);

  if (cart.items.length === 0) {
    return (
      <div className="shell-container py-10">
        <h1 className="font-display text-[28px] font-bold">Your cart</h1>
        <div className="py-20 text-center">
          <p className="mb-6 text-[16px] text-ink-55">Your cart is empty.</p>
          <Link href="/shop" className="btn btn-primary">
            Browse medicines
          </Link>
        </div>
      </div>
    );
  }

  const blocked = cart.blockedItems.length > 0;

  return (
    <div className="shell-container py-10">
      <h1 className="font-display text-[28px] font-bold">Your cart</h1>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-4 rounded-card bg-white p-4 shadow-card sm:flex-nowrap"
            >
              <ImageSlot
                src={item.product.imageSrc}
                position={item.product.imagePosition}
                placeholder={`Photo: ${item.product.name}`}
                className="h-20 w-20 shrink-0 rounded-inner"
              />

              <div className="min-w-0 flex-1">
                <Link href={`/product/${item.productId}`} className="text-[15px] font-bold text-ink no-underline hover:underline">
                  {item.product.name}
                </Link>
                <div className="mt-1 text-[13px] text-ink-50">{fmtK(item.product.priceNgwee)} each</div>
                {item.product.rx && !cart.approvedIds.has(item.productId) && (
                  <Link
                    href={`/prescription/${item.productId}`}
                    className="mt-2 inline-block rounded-full bg-amber-tint px-2.5 py-1 text-[11.5px] font-bold text-amber no-underline"
                  >
                    Awaiting pharmacist approval
                  </Link>
                )}
              </div>

              <CartRowControls productId={item.productId} qty={item.qty} />

              <div className="min-w-20 text-right font-display text-[15px] font-bold text-green-dark">
                {fmtK(item.product.priceNgwee * item.qty)}
              </div>
            </div>
          ))}
        </div>

        <OrderSummary subtotalNgwee={cart.subtotalNgwee} deliveryNgwee={DELIVERY_FEE_NGWEE} sticky>
          {blocked ? (
            <>
              <button type="button" className="btn btn-primary btn-lg w-full" disabled>
                Go to checkout
              </button>
              <p className="mt-3 text-[13px] leading-relaxed text-amber">
                A pharmacist still needs to approve:{" "}
                {cart.blockedItems.map((i) => i.product.name).join(", ")}.
              </p>
            </>
          ) : (
            <Link href="/checkout" className="btn btn-primary btn-lg w-full">
              Go to checkout
            </Link>
          )}
        </OrderSummary>
      </div>
    </div>
  );
}
