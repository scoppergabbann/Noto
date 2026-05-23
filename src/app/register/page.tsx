"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    setError("");

    const sb = createClient();
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "/auth/callback";

    const { error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
  }

  if (done)
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="card w-full max-w-sm text-center">
          <div className="mb-3 text-[48px]" aria-hidden="true">
            📬
          </div>
          <h2 className="text-heading mb-2 font-serif text-[22px] font-semibold">Cek emailmu!</h2>
          <p className="text-muted mb-6 text-[15px] leading-relaxed">
            Kami kirim link konfirmasi ke{" "}
            <strong className="text-heading font-semibold">{email}</strong>. Klik link itu untuk
            mengaktifkan akun.
          </p>
          <Link
            href="/login"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-br from-amber to-amber-deep text-[15px] font-bold text-white shadow-glow transition hover:brightness-105"
          >
            Ke halaman login
          </Link>
        </div>
      </div>
    );

  const inputClass =
    "min-h-[48px] w-full rounded-xl border border-black/[.08] bg-white px-4 py-3 text-[15px] text-heading outline-none transition placeholder:text-subtle focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white touch-manipulation";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber to-amber-deep text-white">
            <span className="font-serif text-[22px] font-bold">N</span>
          </div>
          <h1 className="text-heading font-serif text-[26px] font-semibold tracking-tight">Noto</h1>
          <p className="text-muted mt-1 text-[15px]">Mulai kelola finansialmu</p>
        </div>

        <form onSubmit={handleRegister} className="card flex flex-col gap-4" noValidate>
          {[
            {
              id: "name",
              label: "Nama lengkap",
              type: "text",
              val: name,
              set: setName,
              ph: "Rangga Aditya",
              auto: "name",
            },
            {
              id: "email",
              label: "Email",
              type: "email",
              val: email,
              set: setEmail,
              ph: "kamu@email.com",
              auto: "email",
            },
            {
              id: "password",
              label: "Password",
              type: "password",
              val: password,
              set: setPassword,
              ph: "Min. 6 karakter",
              auto: "new-password",
            },
          ].map(({ id, label, type, val, set, ph, auto }) => (
            <div key={id} className="flex flex-col gap-1.5">
              <label htmlFor={id} className="text-heading text-[13.5px] font-semibold">
                {label}
              </label>
              <input
                id={id}
                type={type}
                required
                autoComplete={auto}
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={ph}
                className={inputClass}
              />
            </div>
          ))}

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
            className="min-h-[48px] w-full touch-manipulation rounded-xl bg-gradient-to-br from-amber to-amber-deep py-3 text-[15px] font-bold text-white shadow-glow transition hover:-translate-y-px hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber active:translate-y-0 disabled:opacity-60"
          >
            {loading ? "Mendaftar…" : "Daftar sekarang"}
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
      </div>
    </div>
  );
}
