"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mobileNavItems } from "./nav-config";

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/[.08] bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1117]/95 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex justify-around px-2 py-1.5">
        {mobileNavItems.map(({ href, short, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-label={short}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-1",
                "touch-manipulation rounded-xl transition-all",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber",
                active ? "text-amber-deep dark:text-amber" : "text-ink-dim dark:text-slate-400"
              )}
            >
              <div
                className={cn(
                  "rounded-[10px] p-1.5 transition-all",
                  active && "bg-amber/12 dark:bg-amber/15"
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.3 : 1.8} aria-hidden="true" />
              </div>
              <span className="text-[10.5px] font-semibold leading-none">{short}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
