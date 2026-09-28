"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { BagIcon, LogoMark, MenuIcon, UserIcon } from "./icons";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/pharmacies", label: "Nearby pharmacies" },
  { href: "/track", label: "Track order" },
  { href: "/chat", label: "Chat with pharmacist" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { cartCount, toast } = useStore();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const current = (href: string) => (pathname === href || pathname.startsWith(href + "/") ? "page" : undefined);

  return (
    <>
      <header className="nav">
        <div className="container nav-bar">
          <div className="nav-left">
            <Link href="/" className="brand">
              <span className="brand-mark">
                <LogoMark />
              </span>
              <span className="brand-name">Umuti Express</span>
            </Link>
            <nav className="nav-links" aria-label="Main">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="nav-link" aria-current={current(l.href)}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="nav-right">
            <Link href="/account" className="nav-account">
              <UserIcon />
              <span>Account</span>
            </Link>
            <Link href="/cart" className="nav-cart">
              <BagIcon />
              <span>Cart</span>
              {cartCount > 0 && <span className="nav-cart-count">{cartCount}</span>}
            </Link>
            <button className="hamburger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
              <MenuIcon />
            </button>
          </div>
        </div>
        <nav className="container mobile-menu" data-open={open} aria-label="Mobile">
          {[...LINKS, { href: "/account", label: "Account" }].map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
