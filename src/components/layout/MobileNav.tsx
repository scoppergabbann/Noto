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
      className="fixed bottom-3 left-3 right-3 z-50 rounded-[22px] border border-black/[.06] bg-white/95 p-1.5 shadow-[0_10px_32px_rgba(16,24,40,.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1117]/95 lg:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex justify-around gap-1">
        {mobileNavItems.map(({ href, short, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-label={short}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 px-1",
                "touch-manipulation rounded-[16px] transition-all",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber",
                active
                  ? "bg-[#EEF4FF] text-[#275E9D] dark:bg-white/10 dark:text-blue-300"
                  : "text-[#858C97] hover:bg-[#F0F1F3] dark:text-slate-400 dark:hover:bg-white/5"
              )}
            >
              <div className="rounded-[10px] p-1 transition-all">
                <Icon size={22} strokeWidth={active ? 2.3 : 1.8} aria-hidden="true" />
              </div>
              <span className="text-[10.5px] font-bold leading-none">{short}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
