"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, comingSoon } from "./nav-config";
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
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <aside
      aria-label="Navigasi sidebar"
      className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col gap-1 overflow-y-auto border-r border-black/[.06] bg-surface-base/80 px-3 py-5 backdrop-blur dark:border-white/[.06] dark:bg-night-base/80 lg:flex"
    >
      {/* Logo */}
      <div className="mb-4 px-3">
        <span className="text-heading font-serif text-[22px] font-semibold tracking-tight">
          Noto
        </span>
        <span className="text-subtle ml-1.5 text-[11px] font-bold">urip</span>
      </div>

      {/* Nav items */}
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-[14.5px] font-medium transition",
            active(href)
              ? "bg-white text-ink shadow-soft dark:bg-white/5 dark:text-slate-100"
              : "text-ink-dim hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"
          )}
        >
          <Icon
            size={19}
            className={cn("transition", active(href) ? "text-amber-deep" : "text-ink-faint")}
          />
          {label}
        </Link>
      ))}

      {comingSoon.length > 0 && (
        <div className="mt-2 border-t border-black/[.06] pt-2 dark:border-white/[.06]">
          {comingSoon.map(({ label, icon: Icon }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-ink-faint opacity-50"
            >
              <Icon size={19} />
              {label}
              <span className="ml-auto rounded-md bg-black/[.05] px-1.5 py-0.5 text-[10px] font-bold dark:bg-white/10">
                soon
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-1.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-[14.5px] font-medium transition",
            pathname === "/settings"
              ? "bg-white text-ink shadow-soft dark:bg-white/5 dark:text-slate-100"
              : "text-ink-dim hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"
          )}
        >
          <Settings
            size={19}
            className={cn(
              "transition",
              pathname === "/settings" ? "text-amber-deep" : "text-ink-faint"
            )}
          />
          Pengaturan
        </Link>

        {/* User chip */}
        <div className="flex items-center gap-3 rounded-2xl border border-black/[.08] bg-white p-3 dark:border-white/10 dark:bg-white/5">
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
            className="rounded-lg p-1.5 text-ink-faint transition hover:bg-neg-soft hover:text-neg-strong dark:hover:bg-neg/15 dark:hover:text-neg-dark"
          >
            <LogOut size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </aside>
  );
}
