"use client";

import { useRef, useState, useEffect } from "react";
import { Download, Upload, RotateCcw, Save, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { downloadBackup, importData, resetAll } from "@/lib/stores/backup";
import { createClient } from "@/lib/supabase/client";

type Toast = { ok: boolean; text: string } | null;

function Toast({ msg, onDismiss }: { msg: Toast; onDismiss: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [msg, onDismiss]);

  if (!msg) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-3 text-[14px] font-semibold shadow-softlg lg:bottom-6 ${
        msg.ok
          ? "bg-pos-strong text-white dark:bg-pos-dark dark:text-night-base"
          : "bg-neg text-white"
      }`}
    >
      {msg.ok ? "✓" : "✗"} {msg.text}
    </div>
  );
}

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [resetOpen, setResetOpen] = useState(false);

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [originalName, setOriginalName] = useState("");

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const u = data.user;
        if (!u) return;
        const n = u.user_metadata?.full_name ?? u.user_metadata?.name ?? "";
        setName(n);
        setOriginalName(n);
        setEmail(u.email ?? "");
        setLoadingProfile(false);
      });
  }, []);

  async function saveProfile() {
    if (!name.trim()) return;
    setSavingProfile(true);
    const { error } = await createClient().auth.updateUser({
      data: { full_name: name },
    });
    setSavingProfile(false);
    if (error) {
      setToast({ ok: false, text: error.message });
    } else {
      setOriginalName(name);
      setIsDirty(false);
      setToast({ ok: true, text: "Profil berhasil disimpan." });
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importData(String(reader.result));
      setToast({ ok: res.ok, text: res.message });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <>
      <PageHeader
        eyebrow="Pengaturan"
        title={
          <>
            Kelola <em className="italic text-amber-text dark:text-amber">akunmu</em>.
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
              <User size={18} />
            </div>
            <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[19px]">
              Profil
            </h2>
          </div>

          {loadingProfile ? (
            <div className="space-y-3">
              <div className="h-[72px] animate-pulse rounded-xl bg-black/[.05] dark:bg-white/5" />
              <div className="h-[72px] animate-pulse rounded-xl bg-black/[.05] dark:bg-white/5" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input
                label="Nama lengkap"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setIsDirty(e.target.value !== originalName);
                }}
                placeholder="Nama kamu"
              />
              <Input
                label="Email"
                value={email}
                readOnly
                hint="Email tidak bisa diubah"
                className="cursor-not-allowed opacity-60"
              />
              {isDirty && (
                <Button onClick={saveProfile} disabled={savingProfile} className="w-full">
                  <Save size={16} />
                  {savingProfile ? "Menyimpan…" : "Simpan profil"}
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Backup */}
        <Card>
          <h2 className="text-heading mb-1 font-serif text-[17px] font-semibold sm:text-[19px]">
            Backup & Pemulihan
          </h2>
          <p className="text-muted mb-4 text-[13.5px] leading-relaxed">
            Ekspor data sebagai file JSON untuk cadangan atau pindah perangkat.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button onClick={downloadBackup} className="w-full">
              <Download size={16} /> Ekspor data
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()} className="w-full">
              <Upload size={16} /> Impor data
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={onFile}
            />
          </div>
        </Card>

        {/* Reset */}
        <Card>
          <h2 className="text-heading mb-1 font-serif text-[17px] font-semibold sm:text-[19px]">
            Reset Data
          </h2>
          <p className="text-muted mb-4 text-[13.5px] leading-relaxed">
            Kembalikan tampilan ke data contoh awal. Data di Supabase tidak ikut terhapus.
          </p>
          <Button variant="danger" onClick={() => setResetOpen(true)} className="w-full">
            <RotateCcw size={16} /> Reset tampilan
          </Button>
        </Card>

        {/* Tentang penyimpanan */}
        <Card>
          <h2 className="text-heading mb-1 font-serif text-[17px] font-semibold sm:text-[19px]">
            Penyimpanan
          </h2>
          <p className="text-muted text-[13.5px] leading-relaxed">
            Data disimpan di <strong className="text-heading font-semibold">Supabase</strong> dan
            tersinkron antar perangkat. Setiap user hanya bisa akses datanya sendiri (Row Level
            Security).
          </p>
        </Card>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetAll();
          setToast({ ok: true, text: "Tampilan dikembalikan ke data contoh." });
        }}
        title="Reset tampilan?"
        message="Tampilan lokal akan dikembalikan ke data contoh. Data di Supabase tidak ikut terhapus."
        confirmLabel="Reset"
      />

      <Toast msg={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
