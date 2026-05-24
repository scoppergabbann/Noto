"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
  Moon, 
  Sun
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (!trimmedEmail) {
      setError("Email wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    setError("");

    const sb = createClient();

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "/auth/callback";

    const { error } = await sb.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { full_name: trimmedName },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Email ini sudah terdaftar. Coba masuk ke akunmu."
          : error.message
      );
      setLoading(false);
      return;
    }

    setDone(true);
  }

  const [isDark, setIsDark] = useState(false);

useEffect(() => {
  const root = document.documentElement;
  const saved = JSON.parse(localStorage.getItem("noto-theme") || "{}");
  const dark = Boolean(saved?.state?.isDark);

  setIsDark(dark);
  root.classList.toggle("dark", dark);
}, []);

  function toggleTheme() {
    const next = !isDark;

    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);

    localStorage.setItem(
      "noto-theme",
      JSON.stringify({
        state: {
          isDark: next,
        },
      })
    );
  }

  if (done) {
    return (
      <div className="grid min-h-screen grid-cols-1 bg-[#f4f5f8] text-ink transition-colors dark:bg-[#07090f] lg:grid-cols-[1.05fr_.95fr]">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
          className="fixed right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-2xl border border-black/[.08] bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden border-r border-black/[.06] bg-[#fffaf1] px-10 py-10 transition-colors dark:border-white/[.06] dark:bg-[#080b11] lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-amber/20 blur-[90px]" />
          <div className="pointer-events-none absolute bottom-10 right-0 h-96 w-96 rounded-full bg-orange-500/10 blur-[110px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.08]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:56px_56px] dark:bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]" />
          </div>

          <div className="relative z-10">
            <Link href="/" aria-label="Noto" className="inline-flex items-center">
              <img
                src="/logo-noto-header-transparent.png"
                alt="Noto"
                className="h-14 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber/20 bg-amber/10 px-3 py-1.5 text-[12.5px] font-semibold text-amber">
              <CheckCircle2 size={14} />
              Satu langkah lagi
            </div>

            <h1 className="font-serif text-[52px] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950 dark:text-white">
              Cek emailmu,
              <br />
              <em className="italic text-amber">aktifkan akunmu.</em>
            </h1>

            <p className="mt-5 max-w-md text-[16px] leading-7 text-slate-700 dark:text-slate-300">
              Link konfirmasi sudah dikirim. Setelah akun aktif, kamu bisa mulai
              menata cashflow, tabungan, aset, utang, dan investasi pribadi.
            </p>
          </div>

          <div className="relative z-10 text-[12.5px] text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} Noto. Catatan hidup dan finansialmu.
          </div>
        </section>

        {/* Done panel */}
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 lg:px-10">
          <div className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-amber/20 blur-[90px] dark:bg-amber/10" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-300/30 blur-[90px] dark:bg-slate-800/40" />

          <div className="relative z-10 w-full max-w-[430px]">
            <div className="mb-8 text-center lg:hidden">
              <Link href="/" aria-label="Noto" className="inline-flex justify-center">
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

            <div className="rounded-[28px] border border-black/[.07] bg-white/85 p-6 text-center shadow-[0_24px_80px_rgba(15,23,42,.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[.06] sm:p-8">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-amber/15 text-amber-text dark:text-amber">
                <Mail size={30} />
              </div>

              <h2 className="text-heading mb-2 font-serif text-[28px] font-semibold tracking-[-0.03em]">
                Cek emailmu
              </h2>

              <p className="text-muted mb-6 text-[15px] leading-7">
                Kami mengirim link konfirmasi ke{" "}
                <strong className="text-heading font-semibold">{email}</strong>. Klik link
                tersebut untuk mengaktifkan akun Noto.
              </p>

              <Link
                href="/login"
                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-amber to-amber-deep text-[15px] font-bold text-white shadow-glow transition hover:-translate-y-px hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber active:translate-y-0"
              >
                Ke halaman login
              </Link>

              <p className="text-subtle mt-5 text-[12.5px] leading-5">
                Tidak menemukan email? Cek folder spam atau coba daftar ulang beberapa saat lagi.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
      <div className="grid min-h-screen grid-cols-1 bg-[#f4f5f8] text-ink transition-colors dark:bg-[#07090f] lg:grid-cols-[1.05fr_.95fr]">
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      className="fixed right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-2xl border border-black/[.08] bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden border-r border-black/[.06] bg-[#fffaf1] px-10 py-10 transition-colors dark:border-white/[.06] dark:bg-[#080b11] lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-amber/20 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-96 w-96 rounded-full bg-orange-500/10 blur-[110px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:56px_56px] dark:bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]" />
        </div>

        <div className="relative z-10">
          <Link href="/" aria-label="Noto" className="inline-flex items-center">
            <img
              src="/logo-noto-header-transparent.png"
              alt="Noto"
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber/20 bg-amber/10 px-3 py-1.5 text-[12.5px] font-semibold text-amber">
            <Sparkles size={14} />
            Mulai workspace finansialmu
          </div>

          <h1 className="font-serif text-[52px] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950 dark:text-white">
            Noto urip,
            <br />
            <em className="italic text-amber">noto finansial.</em>
          </h1>

          <p className="mt-5 max-w-md text-[16px] leading-7 text-slate-300">
            Bangun kebiasaan mencatat cashflow, tabungan, aset, utang, dan
            investasi pribadi dalam satu tempat yang rapi dan tenang.
          </p>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {[
              {
                icon: WalletCards,
                title: "Track",
                desc: "Cashflow & aset",
              },
              {
                icon: ShieldCheck,
                title: "Private",
                desc: "Akun pribadimu",
              },
              {
                icon: LockKeyhole,
                title: "Secure",
                desc: "Akses terlindungi",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-black/[.08] bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[.04]"
                >
                  <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-amber/15 text-amber">
                    <Icon size={17} />
                  </div>
                  <div className="text-[13px] font-bold text-slate-950 dark:text-white">{item.title}</div>
                  <div className="mt-0.5 text-[12px] text-slate-600 dark:text-slate-400">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 text-[12.5px] text-slate-500">
          © {new Date().getFullYear()} Noto. Catatan hidup dan finansialmu.
        </div>
      </section>

      {/* Register panel */}
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 lg:px-10">
        <div className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-amber/20 blur-[90px] dark:bg-amber/10" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-slate-300/30 blur-[90px] dark:bg-slate-800/40" />

        <div className="relative z-10 w-full max-w-[430px]">
          {/* Mobile branding */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" aria-label="Noto" className="inline-flex justify-center">
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

          <div className="rounded-[28px] border border-black/[.07] bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[.06] sm:p-7">
            <div className="mb-6">
              <div className="mb-3 hidden lg:block">
                <img
                  src="/logo-noto-mark-transparent.png"
                  alt="Noto"
                  className="h-11 w-auto object-contain"
                />
              </div>

              <h2 className="text-heading font-serif text-[28px] font-semibold tracking-[-0.03em]">
                Buat akun Noto
              </h2>
              <p className="text-muted mt-1 text-[14.5px] leading-6">
                Mulai menata hidup dan finansialmu dari satu catatan kecil.
              </p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-heading text-[13.5px] font-semibold">
                  Nama lengkap
                </label>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="text-subtle pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rangga Aditya"
                    className="text-heading placeholder:text-subtle min-h-[50px] w-full touch-manipulation rounded-2xl border border-black/[.08] bg-white px-4 py-3 pl-11 text-[15px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-heading text-[13.5px] font-semibold">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="text-subtle pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kamu@email.com"
                    className="text-heading placeholder:text-subtle min-h-[50px] w-full touch-manipulation rounded-2xl border border-black/[.08] bg-white px-4 py-3 pl-11 text-[15px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-heading text-[13.5px] font-semibold">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="text-subtle pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="text-heading placeholder:text-subtle min-h-[50px] w-full touch-manipulation rounded-2xl border border-black/[.08] bg-white px-4 py-3 pl-11 pr-12 text-[15px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="text-subtle absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl transition hover:bg-black/[.04] hover:text-heading focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber dark:hover:bg-white/10"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <p className="text-subtle text-[12.5px]">
                  Gunakan minimal 6 karakter agar akunmu lebih aman.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-neg/15 bg-neg-soft px-4 py-3 text-[14px] font-medium leading-6 text-neg-strong dark:bg-neg/15 dark:text-neg-dark"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 min-h-[50px] w-full touch-manipulation rounded-2xl bg-gradient-to-br from-amber to-amber-deep py-3 text-[15px] font-bold text-white shadow-glow transition hover:-translate-y-px hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber active:translate-y-0 active:brightness-95 disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? "Membuat akun…" : "Daftar sekarang"}
              </button>

              <p className="text-muted text-center text-[14px]">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-amber-text hover:underline dark:text-amber"
                >
                  Masuk
                </Link>
              </p>
            </form>

            <div className="mt-5 rounded-2xl border border-black/[.06] bg-surface-sunken px-4 py-3 dark:border-white/10 dark:bg-white/[.04]">
              <div className="flex items-start gap-2.5">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-text dark:text-amber"
                />
                <p className="text-muted text-[12.5px] leading-5">
                  Setelah daftar, kamu perlu konfirmasi email untuk mengaktifkan akun Noto.
                </p>
              </div>
            </div>
          </div>

          <p className="text-subtle mt-5 text-center text-[12.5px]">
            Satu akun untuk mencatat dan membaca perjalanan finansialmu.
          </p>

          <Link
            href="/login"
            className="text-muted mx-auto mt-4 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold transition hover:text-heading"
          >
            <ArrowLeft size={14} />
            Kembali ke login
          </Link>
        </div>
      </main>
    </div>
  );
}