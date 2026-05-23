"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mobileNavItems } from "./nav-config";

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="pb-safe fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-black/[.08] bg-white/95 px-2 pt-2 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1117]/95 lg:hidden">
      {mobileNavItems.map(({ href, short, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10.5px] font-semibold transition-all",
              active ? "text-amber-deep dark:text-amber" : "text-ink-dim dark:text-slate-400"
            )}
          >
            <div
              className={cn(
                "mb-0.5 rounded-xl p-1.5 transition-all",
                active && "bg-amber/10 dark:bg-amber/15"
              )}
            >
              <Icon
                size={21}
                strokeWidth={active ? 2.4 : 1.8}
                className={
                  active ? "text-amber-deep dark:text-amber" : "text-ink-faint dark:text-slate-500"
                }
              />
            </div>
            <span className="max-w-full truncate">{short}</span>
          </Link>
        );
      })}
    </nav>
  );
}
