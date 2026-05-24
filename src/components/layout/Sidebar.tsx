"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups } from "./nav-config";
import { createClient } from "@/lib/supabase/client";

export function Sidebar({
  userName,
  userEmail,
  userId: _userId,
}: {
  userName: string;
  userEmail: string;
  userId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <aside
      aria-label="Navigasi sidebar"
      className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col overflow-y-auto border-r border-black/[.06] bg-surface-base/80 px-3 py-5 backdrop-blur dark:border-white/[.06] dark:bg-night-base/80 lg:flex"
    >
      {/* Logo */}
      <div className="mb-5 flex items-center gap-2.5 px-2">
        <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-gradient-to-br from-amber to-amber-deep font-serif text-[16px] font-bold text-white">
          N
        </div>
        <span className="text-heading font-serif text-[19px] font-semibold tracking-tight">
          Noto
        </span>
      </div>

      {/* Nav groups */}
      <nav aria-label="Menu navigasi" className="flex-1 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            {/* Section label */}
            <p className="text-subtle mb-1 px-3 text-[10.5px] font-bold tracking-[.12em]">
              {group.title}
            </p>

            {/* Items */}
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = active(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber",
                        isActive
                          ? "bg-white text-ink shadow-soft dark:bg-white/[.07] dark:text-slate-100"
                          : "text-ink-dim hover:bg-white/70 hover:text-ink dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                      )}
                    >
                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2.3 : 1.9}
                        className={cn(
                          "shrink-0 transition-colors",
                          isActive ? "text-amber-deep" : "text-ink-faint dark:text-slate-500"
                        )}
                        aria-hidden="true"
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User chip + logout */}
      <div className="mt-4 border-t border-black/[.06] pt-4 dark:border-white/[.06]">
        <div className="flex items-center gap-3 rounded-2xl border border-black/[.07] bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-heading truncate text-[13.5px] font-semibold">{userName}</div>
            <div className="text-subtle truncate text-[11.5px]">{userEmail}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar"
            aria-label="Keluar dari akun"
            className="grid h-9 w-9 shrink-0 touch-manipulation place-items-center rounded-xl text-ink-faint transition hover:bg-neg-soft hover:text-neg-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-neg dark:hover:bg-neg/15 dark:hover:text-neg-dark"
          >
            <LogOut size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
