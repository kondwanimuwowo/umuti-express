"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "@/lib/actions/account";
import { LogoMark, MenuIcon } from "@/components/icons";

export type NavIcon = "orders" | "products" | "prescriptions" | "chats" | "settings" | "catalogue" | "pharmacies";
export type NavItem = { href: string; label: string; icon: NavIcon; count?: number };
export type NavSection = { title?: string; links: NavItem[] };

type Props = {
  sections: NavSection[];
  /** Owner-only settings, reached from the user menu rather than the main navigation. */
  settingsHref?: string;
  pharmacyName: string | null;
  roleLabel: string;
  user: { name: string; email: string };
  children: React.ReactNode;
};

const ICON_PATHS: Record<NavIcon, React.ReactNode> = {
  orders: (
    <>
      <path d="M6 7h15l-1.5 9H7.5z" />
      <path d="M6 7 5 3H2" />
      <circle cx="9" cy="20" r="1.2" />
      <circle cx="18" cy="20" r="1.2" />
    </>
  ),
  products: (
    <>
      <path d="M3 8 12 3l9 5v8l-9 5-9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </>
  ),
  prescriptions: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h7M9 17h5" />
    </>
  ),
  chats: <path d="M4 5h16v11H9l-5 4z" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  catalogue: (
    <>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M17 14v6M14 17h6" />
    </>
  ),
  pharmacies: (
    <>
      <path d="M3 10 5 4h14l2 6" />
      <path d="M4 10v10h16V10M9 20v-6h6v6" />
    </>
  ),
};

function NavGlyph({ name }: { name: NavIcon }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICON_PATHS[name]}
    </svg>
  );
}

function UserFooter({ user, roleLabel, settingsHref }: { user: Props["user"]; roleLabel: string; settingsHref?: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  const item = "block w-full rounded-inner px-3 py-2.5 text-left text-[13.5px] font-semibold text-ink-70 no-underline hover:bg-surface hover:text-ink";

  return (
    <div ref={root} className="relative border-t border-white/10 p-3">
      {open && (
        <div role="menu" className="absolute right-3 bottom-[calc(100%-4px)] left-3 rounded-card bg-white p-1.5 shadow-card">
          {settingsHref && (
            <Link href={settingsHref} role="menuitem" className={item}>
              Settings
            </Link>
          )}
          <Link href="/account" role="menuitem" className={item}>
            Account
          </Link>
          <Link href="/shop" role="menuitem" className={item}>
            View storefront
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={pending}
            onClick={() => startTransition(async () => void (await signOut()))}
            className={`${item} disabled:opacity-50`}
          >
            {pending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-inner px-2 py-2 text-left hover:bg-white/[0.07]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green text-[12.5px] font-bold text-white">
          {initials || "?"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] leading-tight font-bold text-white">{user.name}</span>
          <span className="block truncate text-[12px] leading-tight text-white/50">{roleLabel}</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/50" aria-hidden>
          <path d="m7 15 5-5 5 5" />
        </svg>
      </button>
    </div>
  );
}

/** The most specific match wins, so /dashboard/admin/catalogue does not also light up /dashboard/admin. */
function currentHref(links: { href: string }[], pathname: string) {
  return links
    .filter((l) => pathname === l.href || pathname.startsWith(l.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

function SidebarBody({ sections, roleLabel, user, settingsHref }: Pick<Props, "sections" | "roleLabel" | "user" | "settingsHref">) {
  const pathname = usePathname();
  const current = currentHref(sections.flatMap((s) => s.links), pathname);
  return (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-5 pt-6 pb-5 text-white no-underline">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-green text-white">
          <LogoMark />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-[16px] leading-tight font-bold">Umuti Express</span>
          <span className="block text-[11.5px] leading-tight text-white/55">{roleLabel}</span>
        </span>
      </Link>

      <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3 pb-4">
        {sections.map((section, i) => (
          <div key={section.title ?? i} className={i > 0 ? "mt-6" : "mt-1"}>
            {section.title && (
              <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-white/40 uppercase">{section.title}</div>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.links.map((l) => {
                const active = l.href === current;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-inner px-3 py-2.5 text-[14px] font-semibold no-underline ${
                        active ? "bg-white/[0.12] text-white" : "text-white/70 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      <NavGlyph name={l.icon} />
                      <span className="flex-1">{l.label}</span>
                      {l.count ? (
                        <span
                          aria-label={`${l.count} waiting`}
                          className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-tint px-1.5 text-[11.5px] font-bold text-amber"
                        >
                          {l.count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <UserFooter user={user} roleLabel={roleLabel} settingsHref={settingsHref} />
    </div>
  );
}

export function DashboardShell({ sections, settingsHref, pharmacyName, roleLabel, user, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const all: Pick<NavItem, "href" | "label">[] = sections.flatMap((s) => s.links);
  if (settingsHref) all.push({ href: settingsHref, label: "Settings" });
  const currentItem = all.find((l) => l.href === currentHref(all, pathname));

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="hidden bg-navy lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarBody sections={sections} roleLabel={roleLabel} user={user} settingsHref={settingsHref} />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 bg-white px-5 shadow-nav lg:h-16 lg:px-10">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface lg:hidden"
          >
            <MenuIcon />
          </button>

          <div className="min-w-0 flex-1 truncate text-[14px] text-ink-55">
            {pharmacyName && <span>{pharmacyName}</span>}
            {pharmacyName && currentItem && <span className="px-2 text-ink-40">/</span>}
            {currentItem && <span className="font-bold text-ink">{currentItem.label}</span>}
          </div>

          <Link href="/shop" className="shrink-0 text-[13.5px] font-semibold text-green-dark no-underline hover:underline">
            View storefront
          </Link>
        </header>

        <main className="px-5 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-[1040px]">{children}</div>
        </main>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-[272px] bg-navy lg:hidden"
            >
              <SidebarBody sections={sections} roleLabel={roleLabel} user={user} settingsHref={settingsHref} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
