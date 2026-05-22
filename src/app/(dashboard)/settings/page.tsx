"use client";

import { useRef, useState } from "react";
import { Download, Upload, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { downloadBackup, importData, resetAll } from "@/lib/stores/backup";

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importData(String(reader.result));
      setMsg({ ok: res.ok, text: res.message });
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
            Kelola <em className="italic text-amber-text dark:text-amber">datamu</em>.
          </>
        }
      />

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
        <Card>
          <div className="mb-1 font-serif text-[19px] font-semibold">Backup & Pemulihan</div>
          <div className="mb-4 text-[13.5px] text-ink-dim dark:text-slate-400">
            Semua data Noto tersimpan di perangkat ini (browser). Ekspor berkala agar aman, atau
            pindahkan ke perangkat lain.
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button onClick={downloadBackup}>
              <Download size={16} /> Ekspor data
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Impor data
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={onFile}
            />
          </div>
          {msg && (
            <div
              className={`mt-3.5 rounded-lg px-3 py-2 text-[13px] font-medium ${msg.ok ? "bg-brand-green/10 text-brand-green" : "bg-brand-red/10 text-brand-red"}`}
            >
              {msg.text}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-1 font-serif text-[19px] font-semibold">Reset Data</div>
          <div className="mb-4 text-[13.5px] text-ink-dim dark:text-slate-400">
            Kembalikan semua data ke contoh awal. Berguna untuk mencoba ulang dari nol.
          </div>
          <Button variant="danger" onClick={() => setResetOpen(true)}>
            <RotateCcw size={16} /> Reset ke contoh awal
          </Button>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-1 font-serif text-[19px] font-semibold">Tentang penyimpanan</div>
          <p className="text-[13.5px] leading-relaxed text-ink-dim dark:text-slate-400">
            Saat ini Noto menyimpan data secara lokal di browser (localStorage) — tidak ada server,
            tidak ada akun. Artinya data hanya ada di perangkat & browser ini. Membersihkan data
            browser akan menghapusnya, jadi gunakan fitur Ekspor untuk cadangan. Sinkronisasi
            antar-perangkat akan hadir saat integrasi cloud diaktifkan.
          </p>
        </Card>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetAll();
          setMsg({ ok: true, text: "Data dikembalikan ke contoh awal." });
        }}
        title="Reset semua data?"
        message="Semua catatanmu akan diganti dengan data contoh. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Reset"
      />
    </>
  );
}
