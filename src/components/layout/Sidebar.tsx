"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { navItems, comingSoon } from "./nav-config";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1.5 border-r border-black/5 p-6 dark:border-white/5 lg:flex">
      <div className="flex items-center gap-3 px-2.5 pb-5 pt-1">
        <div className="serif grid h-9 w-9 place-items-center rounded-[10px] bg-gradient-to-br from-amber to-amber-deep text-[19px] font-bold text-white shadow-[0_6px_16px_rgba(240,125,16,.35)]">
          L
        </div>
        <div className="leading-tight">
          <div className="serif text-xl font-semibold tracking-tight">Noto</div>
          <div className="text-[10.5px] text-ink-faint">Noto urip, noto finansial.</div>
        </div>
      </div>

      <div className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[.10em] text-ink-faint">
        Ringkasan
      </div>
      <nav className="flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-[14.5px] font-medium transition",
                active
                  ? "bg-white text-ink shadow-soft dark:bg-white/5 dark:text-slate-100"
                  : "text-ink-dim hover:bg-white dark:text-slate-400 dark:hover:bg-white/5"
              )}
            >
              <Icon
                size={19}
                className={cn("transition", active ? "text-amber-deep" : "text-ink-faint")}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {comingSoon.length > 0 && (
        <>
          <div className="px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[.10em] text-ink-faint">
            Segera Hadir
          </div>
          {comingSoon.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium text-ink-dim opacity-50"
            >
              <Icon size={19} />
              {label}
            </div>
          ))}
        </>
      )}

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
        <div className="flex items-center gap-3 rounded-2xl border border-black/[.08] bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-semibold text-white">
            RA
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-semibold">Rangga A.</div>
            <div className="text-[11.5px] text-ink-faint">Penyimpanan lokal</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
