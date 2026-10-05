import type { Metadata } from "next";
import Link from "next/link";
import { Open_Sans, Ubuntu } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { ToastProvider } from "@/components/Toast";

const ubuntu = Ubuntu({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-ubuntu" });
const openSans = Open_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-open-sans" });

export const metadata: Metadata = {
  title: "Umuti Express",
  description: "Order medicine online from partner pharmacies across Lusaka, with home delivery or pickup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ubuntu.variable} ${openSans.variable}`}>
      <body>
        <ToastProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>

            <footer className="mt-20 bg-navy py-12 text-white">
              <div className="shell-container">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
                  <div>
                    <div className="mb-3 font-display text-[19px] font-bold">Umuti Express</div>
                    <p className="max-w-[280px] text-[13.5px] leading-relaxed text-white/60">
                      Online ordering for medicines, in partnership with pharmacies across Lusaka.
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
                    <span className="text-[13.5px] text-white/80">+260 97 000 0000</span>
                  </div>
                </div>

                <div className="mt-10 border-t border-white/10 pt-6 text-[12.5px] text-white/50">
                  Umuti Express &middot; Lusaka, Zambia
                </div>
              </div>
            </footer>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
