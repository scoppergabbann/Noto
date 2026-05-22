"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          <div className="text-heading mb-3 font-serif text-[36px] font-semibold tracking-tight">
            Noto
          </div>
          <p className="text-muted text-[14.5px]">Masuk untuk melanjutkan ke finansialmu.</p>
        </div>

        <form onSubmit={handleLogin} className="card flex flex-col gap-4">
          <div>
            <label
              className="text-heading mb-1.5 block text-[13.5px] font-semibold"
              htmlFor="email"
            >
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
              className="text-heading placeholder:text-subtle w-full rounded-xl border border-black/[.08] bg-white px-4 py-2.5 text-[14.5px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label
              className="text-heading mb-1.5 block text-[13.5px] font-semibold"
              htmlFor="password"
            >
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
              className="text-heading placeholder:text-subtle w-full rounded-xl border border-black/[.08] bg-white px-4 py-2.5 text-[14.5px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-neg-soft px-4 py-2.5 text-[13.5px] font-medium text-neg-strong dark:bg-neg/15 dark:text-neg-dark">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-xl bg-gradient-to-br from-amber to-amber-deep py-3 text-[15px] font-bold text-white shadow-glow transition hover:-translate-y-px hover:brightness-105 disabled:opacity-60"
          >
            {loading ? "Masuk…" : "Masuk"}
          </button>

          <p className="text-muted text-center text-[13.5px]">
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
    </div>
  );
}
