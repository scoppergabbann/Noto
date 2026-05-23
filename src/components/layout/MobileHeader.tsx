"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { navItems } from "./nav-config";
import { createClient } from "@/lib/supabase/client";

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleLogout() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Sticky top bar */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black/[.06] bg-surface-base/95 px-4 backdrop-blur-xl dark:border-white/[.06] dark:bg-night-base/95 lg:hidden"
        role="banner"
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          aria-label="Noto — kembali ke dashboard"
        >
          <div
            className="grid h-8 w-8 place-items-center rounded-[9px] bg-gradient-to-br from-amber to-amber-deep font-serif text-[16px] font-bold text-white"
            aria-hidden="true"
          >
            N
          </div>
          <span className="text-heading font-serif text-[18px] font-semibold tracking-tight">
            Noto
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className={cn(
              "grid h-11 w-11 touch-manipulation place-items-center rounded-xl",
              "text-ink-dim transition hover:bg-black/[.05] active:bg-black/10",
              "dark:text-slate-400 dark:hover:bg-white/10",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber"
            )}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      {/* Full-screen drawer */}
      {open && (
        <div
          id="mobile-menu"
          role="navigation"
          aria-label="Menu navigasi"
          className="fixed inset-0 z-30 flex flex-col bg-surface-base pt-14 dark:bg-night-base lg:hidden"
        >
          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            <p className="text-subtle mb-2 px-4 text-[11px] font-bold uppercase tracking-[.14em]">
              Navigasi
            </p>
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "mb-0.5 flex min-h-[52px] items-center gap-3.5 rounded-xl px-4 text-[15.5px] font-medium transition",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
                    "touch-manipulation",
                    active
                      ? "bg-white text-ink shadow-soft dark:bg-white/5 dark:text-slate-100"
                      : "text-ink-dim hover:bg-white/70 active:bg-white dark:text-slate-400 dark:hover:bg-white/5"
                  )}
                >
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.3 : 1.8}
                    className={active ? "text-amber-deep" : "text-ink-faint"}
                    aria-hidden="true"
                  />
                  {label}
                  {active && (
                    <span
                      className="ml-auto h-2 w-2 rounded-full bg-amber-deep"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-black/[.06] px-3 pb-8 pt-3 dark:border-white/[.06]">
            <button
              onClick={handleLogout}
              className={cn(
                "flex min-h-[52px] w-full items-center gap-3.5 rounded-xl px-4 text-[15.5px] font-medium",
                "text-neg-strong transition hover:bg-neg-soft active:bg-neg-soft",
                "dark:text-neg-dark dark:hover:bg-neg/15",
                "touch-manipulation",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-neg"
              )}
            >
              Keluar dari akun
            </button>
          </div>
        </div>
      )}
    </>
  );
}
