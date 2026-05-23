"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { navItems } from "./nav-config";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-black/[.06] bg-surface-base/90 px-4 py-3 backdrop-blur-xl dark:border-white/[.06] dark:bg-night-base/90 lg:hidden">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-gradient-to-br from-amber to-amber-deep font-serif text-[17px] font-bold text-white">
            N
          </div>
          <span className="text-heading font-serif text-[18px] font-semibold tracking-tight">
            Noto
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-xl text-ink-dim transition hover:bg-black/[.05] dark:text-slate-400 dark:hover:bg-white/10"
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Fullscreen drawer menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 flex flex-col bg-surface-base pt-[57px] dark:bg-night-base lg:hidden">
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="text-subtle mb-2 px-3 text-[11px] font-bold uppercase tracking-[.12em]">
              Menu
            </div>
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition",
                    active
                      ? "bg-white text-ink shadow-soft dark:bg-white/5 dark:text-slate-100"
                      : "text-ink-dim hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"
                  )}
                >
                  <Icon size={20} className={active ? "text-amber-deep" : "text-ink-faint"} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-black/[.06] px-4 py-4 dark:border-white/[.06]">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-neg-strong transition hover:bg-neg-soft dark:text-neg-dark dark:hover:bg-neg/10"
            >
              Keluar dari akun
            </button>
          </div>
        </div>
      )}
    </>
  );
}
