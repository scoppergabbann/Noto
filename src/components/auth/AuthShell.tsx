"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Moon, Sun } from "lucide-react";

type AuthFeature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export function AuthShell({
  badgeIcon: BadgeIcon,
  badgeText,
  title,
  accent,
  description,
  features,
  children,
}: {
  badgeIcon: LucideIcon;
  badgeText: string;
  title: string;
  accent: string;
  description: string;
  features?: AuthFeature[];
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedRaw = localStorage.getItem("noto-auth-theme");
    const saved = savedRaw ? JSON.parse(savedRaw) : null;
    const dark = saved?.isDark ?? true;

    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  function toggleTheme() {
    const next = !isDark;

    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);

    localStorage.setItem(
      "noto-auth-theme",
      JSON.stringify({
        isDark: next,
      })
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#eef1f5] text-ink transition-colors dark:bg-[#07090f] lg:grid-cols-[1.05fr_.95fr]">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
        className="fixed right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-2xl border border-black/[.08] bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <section className="relative hidden overflow-hidden border-r border-black/[.06] bg-[#f7efe2] px-10 py-10 transition-colors dark:border-white/[.06] dark:bg-[#080b11] lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-amber/20 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-96 w-96 rounded-full bg-orange-500/10 blur-[110px]" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:56px_56px] dark:bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]" />
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            aria-label="Noto"
            className="inline-flex rounded-2xl bg-[#101820] px-4 py-3 shadow-sm dark:bg-transparent dark:px-0 dark:py-0"
          >
            <img
              src="/logo-noto-header-transparent.png"
              alt="Noto"
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber/20 bg-amber/10 px-3 py-1.5 text-[12.5px] font-semibold text-amber">
            <BadgeIcon size={14} />
            {badgeText}
          </div>

          <h1 className="font-serif text-[52px] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950 dark:text-white">
            {title}
            <br />
            <em className="italic text-amber">{accent}</em>
          </h1>

          <p className="mt-5 max-w-md text-[16px] leading-7 text-slate-700 dark:text-slate-300">
            {description}
          </p>

          {features && features.length > 0 && (
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {features.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-black/[.08] bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[.04]"
                  >
                    <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-amber/15 text-amber">
                      <Icon size={17} />
                    </div>
                    <div className="text-[13px] font-bold text-slate-950 dark:text-white">
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-[12px] text-slate-600 dark:text-slate-400">
                      {item.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative z-10 text-[12.5px] text-slate-500">
          © {new Date().getFullYear()} Noto. Catatan hidup dan finansialmu.
        </div>
      </section>

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 lg:px-10">
        <div className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-amber/20 blur-[90px] dark:bg-amber/10" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-300/30 blur-[90px] dark:bg-slate-800/40" />

        <div className="relative z-10 w-full max-w-[430px]">
          <div className="mb-8 text-center lg:hidden">
            <Link
              href="/"
              aria-label="Noto"
              className="inline-flex rounded-2xl bg-[#101820] px-4 py-3 shadow-sm dark:bg-transparent dark:px-0 dark:py-0"
            >
              <img
                src="/logo-noto-header-transparent.png"
                alt="Noto"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-muted mt-3 text-[14.5px]">
              Noto urip, noto finansial.
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}