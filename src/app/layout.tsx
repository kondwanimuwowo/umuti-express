import type { Metadata } from "next";
import { Open_Sans, Ubuntu } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
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
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
