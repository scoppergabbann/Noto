"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setError("✓ Akun dibuat! Silakan login.");
        setMode("login");
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-heading font-serif text-[32px] font-semibold">Noto</h1>
          <p className="text-muted mt-1 text-[13.5px] font-medium">Noto urip, noto finansial.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-3.5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          {error && (
            <div
              className={`rounded-lg px-3 py-2 text-[13px] font-medium ${
                error.startsWith("✓")
                  ? "bg-pos-soft text-pos-strong dark:bg-pos/15 dark:text-pos-dark"
                  : "bg-neg-soft text-neg-strong dark:bg-neg/15 dark:text-neg-dark"
              }`}
            >
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Tunggu..." : mode === "login" ? "Login" : "Daftar"}
          </Button>
        </form>

        <div className="mt-6 border-t border-black/5 pt-4 text-center dark:border-white/5">
          <span className="text-muted text-[13px]">
            {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          </span>
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-amber-text transition hover:text-amber-deep dark:text-amber dark:hover:text-amber-soft"
          >
            {mode === "login" ? "Daftar" : "Login"}
          </button>
        </div>
      </Card>
    </div>
  );
}
