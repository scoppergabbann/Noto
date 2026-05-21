"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { value: string; label: string }[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex gap-1 rounded-xl border border-black/[.08] bg-white p-1 dark:border-white/10 dark:bg-white/5">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition",
            active === t.value
              ? "bg-gradient-to-br from-amber to-amber-deep text-white shadow-sm"
              : "text-ink-dim hover:text-ink dark:text-slate-400 dark:hover:text-slate-100"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
