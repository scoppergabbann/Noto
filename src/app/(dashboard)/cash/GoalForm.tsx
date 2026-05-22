"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Goal } from "@/types";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

const EMOJIS = ["🛡️", "🗾", "🛵", "🏠", "💍", "🎓", "✈️", "💻", "🚗", "🎯"];
const COLORS = ["#1f9e6f", "#6b6ff0", "#ff9d2e", "#e0524a", "#0ea5e9"];

export type GoalDraft = Omit<Goal, "id">;

const empty: GoalDraft = {
  item: "",
  instrument: "",
  targetAmount: 0,
  usedAmount: 0,
  deadline: "",
  durationMonths: 6,
  color: COLORS[1],
  emoji: EMOJIS[9],
};

export function GoalForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: GoalDraft) => void;
  initial?: Goal | null;
}) {
  const [d, setD] = useState<GoalDraft>(empty);
  const [err, setErr] = useState<string>("");

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

  function set<K extends keyof GoalDraft>(k: K, v: GoalDraft[K]) {
    setD((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit() {
    if (!d.item.trim()) return setErr("Nama target wajib diisi.");
    if (d.targetAmount <= 0) return setErr("Target nominal harus lebih dari 0.");
    if (d.usedAmount < 0) return setErr("Jumlah terkumpul tidak boleh negatif.");
    onSubmit(d);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Target" : "Target Baru"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>{initial ? "Simpan" : "Tambah"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <CurrencyInput
          label="Target tabungan (Rp)"
          value={d.targetAmount}
          onChange={(val) => set("targetAmount", val)}
        />
        <Input
          label="Instrumen"
          placeholder="mis. Bank Jago, Reksadana"
          value={d.instrument}
          onChange={(e) => set("instrument", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput
            label="Target tabungan (Rp)"
            value={d.targetAmount}
            onChange={(val) => set("targetAmount", val)}
          />
          <CurrencyInput
            label="Sudah terkumpul (Rp)"
            value={d.usedAmount}
            onChange={(val) => set("usedAmount", val)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Deadline"
            placeholder="mis. Des 2026"
            value={d.deadline}
            onChange={(e) => set("deadline", e.target.value)}
          />
          <Input
            label="Durasi (bulan)"
            type="number"
            inputMode="numeric"
            value={d.durationMonths || ""}
            onChange={(e) => set("durationMonths", Number(e.target.value))}
          />
        </div>
        <div>
          <div className="mb-1.5 text-[13px] font-medium text-ink-dim dark:text-slate-400">
            Ikon
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((em) => (
              <button
                key={em}
                onClick={() => set("emoji", em)}
                className={`grid h-9 w-9 place-items-center rounded-lg text-[18px] transition ${d.emoji === em ? "bg-amber/20 ring-2 ring-amber" : "bg-black/[.04] dark:bg-white/10"}`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-[13px] font-medium text-ink-dim dark:text-slate-400">
            Warna
          </div>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => set("color", c)}
                aria-label={c}
                className={`h-8 w-8 rounded-full transition ${d.color === c ? "ring-2 ring-ink/40 ring-offset-2 dark:ring-offset-[#16171c]" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        {err && (
          <div className="rounded-lg bg-brand-red/10 px-3 py-2 text-[13px] font-medium text-brand-red">
            {err}
          </div>
        )}
      </div>
    </Modal>
  );
}
