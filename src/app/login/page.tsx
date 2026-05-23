"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "auth_callback_failed") setError("Konfirmasi email gagal. Coba daftar ulang.");
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const sb = createClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message === "Invalid login credentials" ? "Email atau password salah." : error.message
      );
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber to-amber-deep text-white">
          <span className="font-serif text-[22px] font-bold">N</span>
        </div>
        <h1 className="text-heading font-serif text-[26px] font-semibold tracking-tight">Noto</h1>
        <p className="text-muted mt-1 text-[15px]">Masuk ke akun kamu</p>
      </div>

      <form onSubmit={handleLogin} className="card flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-heading text-[13.5px] font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
            className="text-heading placeholder:text-subtle min-h-[48px] w-full touch-manipulation rounded-xl border border-black/[.08] bg-white px-4 py-3 text-[15px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-heading text-[13.5px] font-semibold">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="text-heading placeholder:text-subtle min-h-[48px] w-full touch-manipulation rounded-xl border border-black/[.08] bg-white px-4 py-3 text-[15px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl bg-neg-soft px-4 py-3 text-[14px] font-medium text-neg-strong dark:bg-neg/15 dark:text-neg-dark"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="min-h-[48px] w-full touch-manipulation rounded-xl bg-gradient-to-br from-amber to-amber-deep py-3 text-[15px] font-bold text-white shadow-glow transition hover:-translate-y-px hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber active:translate-y-0 active:brightness-95 disabled:opacity-60"
        >
          {loading ? "Masuk…" : "Masuk"}
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
