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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedRaw = localStorage.getItem("noto-auth-theme");
    const saved = savedRaw ? JSON.parse(savedRaw) : null;
    const dark = saved?.isDark ?? false;

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
    <div className="grid min-h-screen grid-cols-1 bg-[#F7F7F9] text-ink transition-colors dark:bg-[#07090f] lg:grid-cols-[1.05fr_.95fr]">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
        className="fixed right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-2xl border border-[#E8EAEE] bg-white/90 text-[#18202B] shadow-[0_6px_20px_rgba(16,24,40,.08)] backdrop-blur transition hover:bg-[#F0F1F3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#275E9D] dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <section className="relative hidden overflow-hidden border-r border-white/10 bg-[#081F4D] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <div className="h-full w-full bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            aria-label="Noto"
            className="inline-flex rounded-2xl bg-white/10 px-4 py-3"
          >
            <img
              src="/logo-noto-header-transparent.png"
              alt="Noto"
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold text-[#BFD5F3]">
            <BadgeIcon size={14} />
            {badgeText}
          </div>

          <h1 className="font-sans text-[52px] font-extrabold leading-[1.03] text-white">
            {title}
            <br />
            <span className="text-[#F0A343]">{accent}</span>
          </h1>

          <p className="mt-5 max-w-md text-[16px] leading-7 text-white/70">{description}</p>

          {features && features.length > 0 && (
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {features.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[18px] border border-white/10 bg-white/[.07] p-4"
                  >
                    <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#F0A343]">
                      <Icon size={17} />
                    </div>
                    <div className="text-[13px] font-bold text-white">{item.title}</div>
                    <div className="mt-0.5 text-[12px] text-white/55">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative z-10 text-[12.5px] text-white/45">
          © {new Date().getFullYear()} Noto. Catatan hidup dan finansialmu.
        </div>
      </section>

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 lg:px-10">
        <div className="relative z-10 w-full max-w-[430px]">
          <div className="mb-8 text-center lg:hidden">
            <Link
              href="/"
              aria-label="Noto"
              className="inline-flex rounded-2xl bg-[#081F4D] px-4 py-3 shadow-[0_8px_24px_rgba(8,31,77,.14)] dark:bg-white/10"
            >
              <img
                src="/logo-noto-header-transparent.png"
                alt="Noto"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="mt-3 text-[14.5px] font-medium text-[#858C97]">
              Noto urip, noto finansial.
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
