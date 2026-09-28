import type { Metadata } from "next";
import Link from "next/link";
import { Open_Sans, Ubuntu } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { SiteHeader } from "@/components/SiteHeader";

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
        <StoreProvider>
          <div className="shell">
            <SiteHeader />
            <main className="main">{children}</main>
            <footer className="footer">
              <div className="container">
                <div className="footer-grid">
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "#fff", marginBottom: 12 }}>Umuti Express</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", maxWidth: 280 }}>
                      Online ordering for medicines, in partnership with pharmacies across Lusaka.
                    </div>
                  </div>
                  <div className="footer-col">
                    <div className="footer-heading">Shop</div>
                    <Link href="/shop">All medicines</Link>
                    <Link href="/pharmacies">Nearby pharmacies</Link>
                  </div>
                  <div className="footer-col">
                    <div className="footer-heading">Support</div>
                    <Link href="/chat">Chat with a pharmacist</Link>
                    <span>+260 97 000 0000</span>
                  </div>
                </div>
                <div className="footer-base">Umuti Express &middot; Lusaka, Zambia</div>
              </div>
            </footer>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
