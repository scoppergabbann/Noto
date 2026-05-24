"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthTextInput } from "@/components/auth/AuthTextInput";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { createClient } from "@/lib/supabase/client";

const loginFeatures = [
  {
    icon: WalletCards,
    title: "Cashflow",
    desc: "Masuk keluar uang",
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

function getAuthCallbackUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  try {
    const url = new URL(raw);
    return `${url.origin}/auth/callback`;
  } catch {
    return "http://localhost:3000/auth/callback";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");

useEffect(() => {
  const err = searchParams.get("error");
  const errorCode = searchParams.get("error_code");

  if (err === "auth_callback_failed") {
    setError(
      "Login gagal diproses. Coba ulangi lagi, atau gunakan metode login lain."
    );
  }

  if (errorCode === "otp_expired") {
    setError(
      "Link konfirmasi sudah kedaluwarsa. Coba daftar ulang atau minta link baru."
    );
  }
}, [searchParams]);

  async function handleGoogleLogin() {
    setLoadingGoogle(true);
    setError("");

    const supabase = createClient();
    const redirectTo = getAuthCallbackUrl();

const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo,
  },
});

    if (error) {
      setError(error.message);
      setLoadingGoogle(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email wajib diisi.");
      return;
    }

    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    setLoadingEmail(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email atau password salah. Coba cek lagi pelan-pelan ya."
          : error.message
      );
      setLoadingEmail(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const loading = loadingEmail || loadingGoogle;

  return (
    <AuthShell
      badgeIcon={Sparkles}
      badgeText="Personal finance workspace"
      title="Noto urip,"
      accent="noto finansial."
      description="Catat cashflow, tabungan, aset, utang, saham, emas, dan perjalanan finansialmu dalam satu tempat yang lebih rapi dan tenang."
      features={loginFeatures}
    >
      <AuthCard
        title="Masuk ke Noto"
        subtitle="Lanjutkan menata hidup dan finansialmu."
        bottomText="Noto membantu membaca, mencatat, dan menata perjalanan finansialmu."
      >
        <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
          <GoogleAuthButton
            label="Lanjut dengan Google"
            loading={loadingGoogle}
            onClick={handleGoogleLogin}
          />

          <AuthDivider label="atau masuk dengan email" />

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
            placeholder="••••••••"
            autoComplete="current-password"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((value) => !value)}
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
            {loadingEmail ? "Sedang masuk…" : "Masuk"}
          </button>

          <p className="text-muted text-center text-[14px]">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-amber-text hover:underline dark:text-amber"
            >
              Daftar gratis
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
              Data finansialmu tetap berada di akun pribadimu. Gunakan metode
              login yang paling aman dan nyaman.
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}