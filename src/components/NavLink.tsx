"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`text-[14.5px] font-semibold whitespace-nowrap no-underline ${
        active ? "text-green-dark" : "text-ink-70 hover:text-ink"
      } ${className}`}
    >
      {children}
    </Link>
  );
}
