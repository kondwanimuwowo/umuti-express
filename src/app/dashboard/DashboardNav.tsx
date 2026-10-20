"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; count?: number };

export function DashboardNav({ links }: { links: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-between gap-3 rounded-inner px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap no-underline ${
              active ? "bg-green-tint text-green-dark" : "text-ink-70 hover:bg-white hover:text-ink"
            }`}
          >
            {l.label}
            {l.count ? (
              <span
                aria-label={`${l.count} waiting`}
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-tint px-1.5 text-[11.5px] font-bold text-amber"
              >
                {l.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
