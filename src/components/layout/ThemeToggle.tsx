"use client";

import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/lib/store";

export function ThemeToggle() {
  const { isDark, toggle } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <button
      onClick={toggle}
      aria-label="Ganti tema"
      className="grid h-10 w-10 place-items-center rounded-xl border border-black/[.08] bg-white transition hover:shadow-soft dark:border-white/10 dark:bg-white/5"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
