"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { navGroups } from "./nav-config";
import { createClient } from "@/lib/supabase/client";

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Auto-close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black/[.06] bg-surface-base/95 px-4 backdrop-blur-xl dark:border-white/[.06] dark:bg-night-base/95 lg:hidden"
        role="banner"
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          aria-label="Noto — kembali ke dashboard"
        >
          <img
          src="/logo-noto-header-transparent.png"
          alt="Noto"
          className="h-8 w-auto object-contain"
        />
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="mobile-drawer"
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

      {/* Drawer */}
      {open && (
        <div
          id="mobile-drawer"
          role="navigation"
          aria-label="Menu navigasi"
          className="fixed inset-0 z-30 flex flex-col bg-surface-base pt-14 dark:bg-night-base lg:hidden"
        >
          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
            {navGroups.map((group) => (
              <div key={group.title}>
                {/* Section label */}
                <p className="text-subtle mb-1.5 px-4 text-[10.5px] font-bold tracking-[.12em]">
                  {group.title}
                </p>

                {/* Items */}
                <ul className="space-y-0.5">
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex min-h-[48px] items-center gap-3.5 rounded-xl px-4 text-[15px] font-medium transition",
                            "touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber",
                            isActive
                              ? "bg-white text-ink shadow-soft dark:bg-white/[.07] dark:text-slate-100"
                              : "text-ink-dim hover:bg-white/70 active:bg-white dark:text-slate-400 dark:hover:bg-white/5"
                          )}
                        >
                          <Icon
                            size={19}
                            strokeWidth={isActive ? 2.3 : 1.8}
                            className={isActive ? "text-amber-deep" : "text-ink-faint"}
                            aria-hidden="true"
                          />
                          {label}
                          {isActive && (
                            <span
                              className="ml-auto h-2 w-2 rounded-full bg-amber-deep"
                              aria-hidden="true"
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-black/[.06] px-3 pb-8 pt-3 dark:border-white/[.06]">
            <button
              onClick={handleLogout}
              className={cn(
                "flex min-h-[48px] w-full items-center gap-3.5 rounded-xl px-4 text-[15px] font-medium",
                "touch-manipulation text-neg-strong transition hover:bg-neg-soft active:bg-neg-soft",
                "dark:text-neg-dark dark:hover:bg-neg/15",
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
