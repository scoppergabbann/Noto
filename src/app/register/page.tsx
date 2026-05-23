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
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
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
        <div className="card w-full max-w-md text-center">
          <div className="mb-3 text-[48px]">📬</div>
          <h2 className="text-heading mb-2 font-serif text-[24px] font-semibold">Cek emailmu!</h2>
          <p className="text-muted mb-5 text-[14.5px]">
            Kami kirim link konfirmasi ke <strong className="text-heading">{email}</strong>. Klik
            link tersebut untuk mengaktifkan akun.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-gradient-to-br from-amber to-amber-deep px-6 py-2.5 text-[14.5px] font-bold text-white shadow-glow"
          >
            Ke halaman login
          </Link>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="text-heading mb-3 font-serif text-[36px] font-semibold tracking-tight">
            Noto
          </div>
          <p className="text-muted text-[14.5px]">Mulai kelola finansialmu hari ini.</p>
        </div>

        <form onSubmit={handleRegister} className="card flex flex-col gap-4 !p-5 sm:!p-6">
          {[
            {
              id: "name",
              label: "Nama",
              type: "text",
              val: name,
              set: setName,
              ph: "Rangga A.",
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
              id: "pass",
              label: "Password",
              type: "password",
              val: password,
              set: setPassword,
              ph: "Min. 6 karakter",
              auto: "new-password",
            },
          ].map(({ id, label, type, val, set, ph, auto }) => (
            <div key={id}>
              <label className="text-heading mb-1.5 block text-[13.5px] font-semibold" htmlFor={id}>
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
                className="text-heading placeholder:text-subtle w-full rounded-xl border border-black/[.08] bg-white px-4 py-2.5 text-[14.5px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          ))}

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
            {loading ? "Mendaftar…" : "Daftar sekarang"}
          </button>

          <p className="text-muted text-center text-[13.5px]">
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
