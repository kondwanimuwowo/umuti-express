"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MenuIcon } from "./icons";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface lg:hidden"
      >
        <MenuIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            aria-label="Mobile"
            className="absolute inset-x-0 top-[68px] overflow-hidden border-t border-black/5 bg-white shadow-nav lg:hidden"
          >
            <div className="shell-container flex flex-col py-2">
              {links.map((l) => {
                const active = pathname === l.href || pathname.startsWith(l.href + "/");
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`py-3 text-[15px] font-semibold no-underline ${active ? "text-green-dark" : "text-ink-70"}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
