"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "./SignOutButton";

type Props = {
  name: string;
  email: string;
  role: string;
  links: { href: string; label: string }[];
};

export function UserMenu({ name, email, role, links }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

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

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2.5 rounded-full py-1.5 pr-3 pl-1.5 hover:bg-surface"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-tint text-[12.5px] font-bold text-green-dark">
          {initials || "?"}
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-[160px] truncate text-[13.5px] leading-tight font-bold">{name}</span>
          <span className="block max-w-[160px] truncate text-[12px] leading-tight text-ink-50">{role}</span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[260px] rounded-card bg-white p-2 shadow-card"
        >
          <div className="border-b border-black/[0.08] px-3 pt-2 pb-3">
            <div className="truncate text-[14px] font-bold">{name}</div>
            <div className="truncate text-[12.5px] text-ink-50">{email}</div>
            <div className="mt-0.5 text-[12.5px] text-ink-62">{role}</div>
          </div>
          <div className="flex flex-col py-1.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                role="menuitem"
                className="rounded-inner px-3 py-2.5 text-[14px] font-semibold text-ink-70 no-underline hover:bg-surface hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-black/[0.08] p-2 pt-3">
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}
