import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

/** The public storefront: header and footer. The dashboard has its own shell. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>

      <footer className="mt-20 bg-navy py-12 text-white">
        <div className="shell-container">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="mb-3 font-display text-[19px] font-bold">Umuti Express</div>
              <p className="max-w-[280px] text-[13.5px] leading-relaxed text-white/60">
                A marketplace of independent pharmacies in Lusaka. Umuti Express does not sell medicines itself.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="mb-1 text-[12px] font-bold tracking-wider text-white/50 uppercase">Shop</div>
              <Link href="/shop" className="text-[13.5px] text-white/80 no-underline hover:text-white">
                All medicines
              </Link>
              <Link href="/pharmacies" className="text-[13.5px] text-white/80 no-underline hover:text-white">
                Nearby pharmacies
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="mb-1 text-[12px] font-bold tracking-wider text-white/50 uppercase">Support</div>
              <Link href="/chat" className="text-[13.5px] text-white/80 no-underline hover:text-white">
                Chat with a pharmacist
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="mb-1 text-[12px] font-bold tracking-wider text-white/50 uppercase">Legal</div>
              <Link href="/legal/terms" className="text-[13.5px] text-white/80 no-underline hover:text-white">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-[13.5px] text-white/80 no-underline hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/legal/medical-disclaimer" className="text-[13.5px] text-white/80 no-underline hover:text-white">
                Medical Disclaimer
              </Link>
              <Link href="/legal/partner-agreement" className="text-[13.5px] text-white/80 no-underline hover:text-white">
                Pharmacy Partner Agreement
              </Link>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-[12.5px] text-white/50">
            Umuti Express &middot; Lusaka, Zambia
          </div>
        </div>
      </footer>
    </div>
  );
}
