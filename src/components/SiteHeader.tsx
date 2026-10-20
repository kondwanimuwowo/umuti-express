import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCartCount, getStaffCounts } from "@/lib/queries";
import { BagIcon, LogoMark, UserIcon } from "./icons";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/pharmacies", label: "Nearby pharmacies" },
  { href: "/track", label: "Track order" },
  { href: "/chat", label: "Chat with pharmacist" },
];

const STAFF_MENU = [
  { href: "/account", label: "Account" },
  { href: "/shop", label: "Shop as a customer" },
  { href: "/cart", label: "Cart" },
  { href: "/track", label: "My orders" },
];

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 text-ink no-underline">
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-green text-white">
        <LogoMark />
      </span>
      <span className="font-display text-[17.5px] font-bold whitespace-nowrap">Umuti Express</span>
    </Link>
  );
}

export async function SiteHeader() {
  const profile = await getProfile();

  if (profile && (profile.role === "PHARMACIST" || profile.role === "ADMIN")) {
    return <StaffHeader profile={profile} />;
  }

  const cartCount = profile ? await getCartCount(profile.id) : 0;

  // An owner whose application is still being reviewed keeps the customer header plus a link to its status.
  const links = profile?.pharmacyId ? [...LINKS, { href: "/dashboard", label: "Dashboard" }] : LINKS;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-nav">
      <div className="shell-container flex h-[68px] items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-8">
          <Logo />

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

/** Pharmacy staff and admins: no shopping links, just where they are and what is waiting. */
async function StaffHeader({ profile }: { profile: NonNullable<Awaited<ReturnType<typeof getProfile>>> }) {
  const pharmacy = profile.pharmacyId
    ? await prisma.pharmacy.findUnique({ where: { id: profile.pharmacyId }, select: { id: true, name: true, status: true } })
    : null;
  const counts = pharmacy?.status === "ACTIVE" ? await getStaffCounts(pharmacy.id) : null;
  const waiting = counts ? counts.orders + counts.prescriptions + counts.chats : 0;

  const isAdmin = profile.role === "ADMIN";
  const role = isAdmin
    ? pharmacy ? `Admin · ${pharmacy.name}` : "Admin"
    : `${profile.isPharmacyOwner ? "Owner" : "Pharmacist"}${pharmacy ? ` · ${pharmacy.name}` : ""}`;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-nav">
      <div className="shell-container flex h-[68px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-5">
          <Logo />
          {pharmacy && (
            <span className="hidden truncate border-l border-black/10 pl-5 text-[14px] font-semibold text-ink-70 md:block">
              {pharmacy.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-full bg-green-tint px-4 py-2 text-[14px] font-semibold text-green-dark no-underline hover:bg-green hover:text-white"
          >
            Dashboard
            {waiting > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-tint px-1.5 text-[11.5px] font-bold text-amber">
                {waiting}
              </span>
            )}
          </Link>
          <UserMenu
            name={profile.fullName ?? profile.email}
            email={profile.email}
            role={role}
            links={STAFF_MENU}
          />
        </div>
      </div>
    </header>
  );
}
