import Link from "next/link";
import { getProfile, isStaff } from "@/lib/auth";
import { getCartCount } from "@/lib/queries";
import { BagIcon, LogoMark, UserIcon } from "./icons";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/pharmacies", label: "Nearby pharmacies" },
  { href: "/track", label: "Track order" },
  { href: "/chat", label: "Chat with pharmacist" },
];

export async function SiteHeader() {
  const profile = await getProfile();
  const cartCount = profile ? await getCartCount(profile.id) : 0;

  const links = isStaff(profile) ? [...LINKS, { href: "/pharmacist", label: "Review queue" }] : LINKS;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-nav">
      <div className="shell-container flex h-[68px] items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 text-ink no-underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-green text-white">
              <LogoMark />
            </span>
            <span className="font-display text-[17.5px] font-bold whitespace-nowrap">Umuti Express</span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.href} href={l.href}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={profile ? "/account" : "/sign-in"}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-[14px] font-semibold text-ink-70 no-underline hover:bg-surface hover:text-ink sm:flex"
          >
            <UserIcon />
            <span>{profile ? "Account" : "Sign in"}</span>
          </Link>

          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full bg-green-tint px-4 py-2 text-[14px] font-semibold text-green-dark no-underline hover:bg-green hover:text-white"
          >
            <BagIcon />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green px-1.5 text-[11.5px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <MobileNav links={[...links, { href: profile ? "/account" : "/sign-in", label: profile ? "Account" : "Sign in" }]} />
        </div>
      </div>
    </header>
  );
}
