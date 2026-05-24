"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthTextInput } from "@/components/auth/AuthTextInput";
import { createClient } from "@/lib/supabase/client";

const registerFeatures = [
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
];

export default function RegisterPage() {
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

  if (done) {
    return (
      <AuthShell
        badgeIcon={CheckCircle2}
        badgeText="Satu langkah lagi"
        title="Cek emailmu,"
        accent="aktifkan akunmu."
        description="Link konfirmasi sudah dikirim. Setelah akun aktif, kamu bisa mulai menata cashflow, tabungan, aset, utang, dan investasi pribadi."
      >
        <AuthCard
          title="Cek emailmu"
          subtitle="Klik link konfirmasi untuk mengaktifkan akun Noto."
        >
          <div className="text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-amber/15 text-amber-text dark:text-amber">
              <Mail size={30} />
            </div>

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
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badgeIcon={Sparkles}
      badgeText="Mulai workspace finansialmu"
      title="Noto urip,"
      accent="noto finansial."
      description="Bangun kebiasaan mencatat cashflow, tabungan, aset, utang, dan investasi pribadi dalam satu tempat yang rapi dan tenang."
      features={registerFeatures}
    >
      <AuthCard
        title="Buat akun Noto"
        subtitle="Mulai menata hidup dan finansialmu dari satu catatan kecil."
        bottomText="Satu akun untuk mencatat dan membaca perjalanan finansialmu."
      >
        <form onSubmit={handleRegister} className="flex flex-col gap-4" noValidate>
          <AuthTextInput
            id="name"
            label="Nama lengkap"
            icon={UserRound}
            value={name}
            onChange={setName}
            placeholder="Rangga Aditya"
            autoComplete="name"
          />

          <AuthTextInput
            id="email"
            label="Email"
            type="email"
            icon={Mail}
            value={email}
            onChange={setEmail}
            placeholder="kamu@email.com"
            autoComplete="email"
          />

          <AuthTextInput
            id="password"
            label="Password"
            icon={LockKeyhole}
            value={password}
            onChange={setPassword}
            placeholder="Min. 6 karakter"
            autoComplete="new-password"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            helper="Gunakan minimal 6 karakter agar akunmu lebih aman."
          />

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

        <Link
          href="/login"
          className="text-muted mx-auto mt-4 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold transition hover:text-heading"
        >
          <ArrowLeft size={14} />
          Kembali ke login
        </Link>
      </AuthCard>
    </AuthShell>
  );
}