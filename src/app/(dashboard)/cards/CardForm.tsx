"use client";

import { useState, useEffect } from "react";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CreditCard } from "@/types";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { rpShort } from "@/lib/format";

export type CardDraft = Omit<CreditCard, "id">;

const GRADIENTS = [
  "linear-gradient(135deg,#3a3f8f,#6b6ff0)",
  "linear-gradient(135deg,#0d6e4f,#1f9e6f)",
  "linear-gradient(135deg,#7a2e2e,#e0524a)",
  "linear-gradient(135deg,#1a1a1f,#3a3a45)",
];

const empty: CardDraft = {
  name: "",
  creditLimit: 0,
  spent: 0,
  paid: 0,
  gradient: GRADIENTS[0],
  last4: "",
};

export function CardForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: CardDraft) => void;
  initial?: CreditCard | null;
}) {
  const [d, setD] = useState<CardDraft>(empty);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (initial) {
      const { id: _id, ...rest } = initial;
      void _id;
      setD(rest);
    } else {
      setD(empty);
    }
    setErr("");
  }, [initial, open]);

  function update<K extends keyof CardDraft>(key: K, value: CardDraft[K]) {
    setD((prev) => ({ ...prev, [key]: value }));
    if (err) setErr("");
  }

  function submit() {
    const name = d.name.trim();
    const last4 = d.last4.trim();

    if (!name) return setErr("Nama kartu wajib diisi.");
    if (last4 && last4.length !== 4) return setErr("4 digit terakhir harus 4 angka.");
    if (d.creditLimit <= 0) return setErr("Limit harus lebih dari 0.");
    if (d.spent < 0) return setErr("Pemakaian tidak boleh negatif.");
    if (d.paid < 0) return setErr("Jumlah dibayar tidak boleh negatif.");
    if (d.spent > d.creditLimit) return setErr("Pemakaian tidak boleh melebihi limit kartu.");
    if (d.paid > d.spent) return setErr("Jumlah dibayar tidak boleh lebih besar dari pemakaian.");

    onSubmit({
      ...d,
      name,
      last4,
    });

    onClose();
  }

  const remainingLimit = Math.max(0, d.creditLimit - d.spent);
  const unpaid = Math.max(0, d.spent - d.paid);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Kartu" : "Kartu Baru"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Batal
          </Button>
          <Button onClick={submit} className="w-full sm:w-auto">
            {initial ? "Simpan" : "Tambah"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Preview card */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 text-white shadow-softlg"
          style={{ background: d.gradient }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-black/20 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/65">
                Credit Card
              </div>
              <div className="max-w-[260px] truncate font-serif text-[21px] font-semibold">
                {d.name.trim() || "Nama Kartu"}
              </div>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
              <CreditCardIcon size={20} />
            </div>
          </div>

          <div className="relative mt-7 flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                Limit
              </div>
              <div className="mt-0.5 font-serif text-[20px] font-bold tabular-nums">
                {rpShort(d.creditLimit)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                Last 4
              </div>
              <div className="mt-0.5 font-mono text-[18px] font-bold tracking-widest">
                **** {d.last4 || "0000"}
              </div>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
          <Input
            label="Nama kartu"
            placeholder="mis. BCA Mastercard"
            value={d.name}
            onChange={(e) => update("name", e.target.value)}
          />

          <Input
            label="4 digit terakhir"
            placeholder="4821"
            inputMode="numeric"
            maxLength={4}
            value={d.last4}
            onChange={(e) => update("last4", e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </div>

        {/* Nominal fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CurrencyInput
            label="Limit kartu (Rp)"
            value={d.creditLimit}
            onChange={(val) => update("creditLimit", val)}
          />

          <CurrencyInput
            label="Pemakaian bulan ini (Rp)"
            value={d.spent}
            onChange={(val) => update("spent", val)}
          />

          <CurrencyInput
            label="Sudah dibayar (Rp)"
            value={d.paid}
            onChange={(val) => update("paid", val)}
          />

          <div className="rounded-xl border border-black/[.06] bg-surface-sunken p-3.5 dark:border-white/10 dark:bg-white/5">
            <div className="text-subtle text-[12px] font-semibold">Ringkasan</div>
            <div className="mt-2 space-y-1.5 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Sisa limit</span>
                <span className="text-heading font-semibold tabular-nums">
                  {rpShort(remainingLimit)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Belum dibayar</span>
                <span className="text-heading font-semibold tabular-nums">
                  {rpShort(unpaid)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Color picker */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-[13px] font-semibold text-ink-dim dark:text-slate-300">
                Warna kartu
              </div>
              <div className="text-subtle text-[12px]">
                Pilih warna yang paling mudah kamu kenali.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {GRADIENTS.map((g, idx) => (
              <button
                key={g}
                type="button"
                onClick={() => update("gradient", g)}
                aria-label={`Pilih warna kartu ${idx + 1}`}
                className={[
                  "h-11 w-16 rounded-xl border transition",
                  d.gradient === g
                    ? "border-white/70 ring-2 ring-amber ring-offset-2 ring-offset-white dark:ring-offset-[#16171c]"
                    : "border-black/10 hover:scale-[1.03] dark:border-white/10",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber",
                ].join(" ")}
                style={{ background: g }}
              />
            ))}
          </div>
        </div>

        {err && (
          <div
            role="alert"
            className="rounded-xl bg-brand-red/10 px-4 py-3 text-[13.5px] font-semibold text-brand-red"
          >
            {err}
          </div>
        )}
      </div>
    </Modal>
  );
}