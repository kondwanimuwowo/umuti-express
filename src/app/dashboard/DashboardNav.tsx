"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav({ links }: { links: { href: string; label: string }[] }) {
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
            className={`rounded-inner px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap no-underline ${
              active ? "bg-green-tint text-green-dark" : "text-ink-70 hover:bg-white hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
