"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-config";

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-black/[.08] bg-white/90 px-1.5 pb-3 pt-2.5 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-[#16171c]/90">
      {navItems.map(({ href, short, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition",
              active ? "text-amber-deep" : "text-ink-dim dark:text-slate-400"
            )}
          >
            <Icon size={20} className={active ? "text-amber-deep" : "text-ink-faint"} />
            {short}
          </Link>
        );
      })}
    </nav>
  );
}
