"use client";

import { useState, useMemo } from "react";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { progressPct } from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { Goal } from "@/types";

export interface TransferDraft {
  fromGoalId: string;
  toGoalId: string;
  amount: number;
  date: string;
  note: string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function TransferForm({
  open,
  onClose,
  onSubmit,
  goals,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: TransferDraft) => Promise<void>;
  goals: Goal[];
  loading?: boolean;
}) {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fromGoal = goals.find((g) => g.id === fromId) ?? null;
  const toGoal = goals.find((g) => g.id === toId) ?? null;

  // Warning: apakah tujuan akan over-target?
  const toAfter = toGoal ? toGoal.usedAmount + amount : 0;
  const willOver = toGoal ? toAfter > toGoal.targetAmount : false;
  const surplus = willOver && toGoal ? toAfter - toGoal.targetAmount : 0;

  // Progress preview setelah transfer
  const fromAfterPct = fromGoal
    ? progressPct(Math.max(0, fromGoal.usedAmount - amount), fromGoal.targetAmount)
    : 0;
  const toAfterPct = toGoal
    ? progressPct(Math.min(toAfter, toGoal.targetAmount), toGoal.targetAmount)
    : 0;

  // Goals yang bisa dipilih sebagai tujuan (tidak boleh sama dengan asal)
  const toOptions = useMemo(() => goals.filter((g) => g.id !== fromId), [goals, fromId]);

  function reset() {
    setFromId("");
    setToId("");
    setAmount(0);
    setDate(today());
    setNote("");
    setErr("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!fromId) return setErr("Pilih asset asal.");
    if (!toId) return setErr("Pilih asset tujuan.");
    if (fromId === toId) return setErr("Asal dan tujuan tidak boleh sama.");
    if (amount <= 0) return setErr("Jumlah transfer harus lebih dari 0.");
    if (!fromGoal) return setErr("Asset asal tidak ditemukan.");
    if (amount > fromGoal.usedAmount)
      return setErr(`Saldo asal hanya ${rpShort(fromGoal.usedAmount)}.`);

    setErr("");
    setSubmitting(true);
    try {
      await onSubmit({ fromGoalId: fromId, toGoalId: toId, amount, date, note });
      reset();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Transfer gagal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Transfer Antar Asset"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="w-full sm:w-auto"
          >
            {submitting ? "Mentransfer…" : "Konfirmasi Transfer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* From → To selector */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <Select
            label="Dari"
            value={fromId}
            onChange={(e) => {
              setFromId(e.target.value);
              setToId("");
            }}
          >
            <option value="">Pilih asset asal…</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.emoji} {g.item} ({rpShort(g.usedAmount)})
              </option>
            ))}
          </Select>

          <div className="text-muted flex h-[44px] items-center justify-center">
            <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </div>

          <Select
            label="Ke"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            disabled={!fromId}
          >
            <option value="">Pilih tujuan…</option>
            {toOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.emoji} {g.item} ({rpShort(g.usedAmount)})
              </option>
            ))}
          </Select>
        </div>

        {/* Preview saldo setelah transfer */}
        {fromGoal && toGoal && (
          <div className="rounded-xl border border-black/[.06] bg-surface-sunken p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-subtle mb-3 text-[12px] font-bold uppercase tracking-wide">
              Preview setelah transfer
            </p>
            <div className="space-y-3">
              {/* From */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-body font-medium">
                    {fromGoal.emoji} {fromGoal.item}
                  </span>
                  <span className="text-muted tabular-nums">
                    <span className="text-neg-strong dark:text-neg-dark">
                      {rpShort(Math.max(0, fromGoal.usedAmount - amount))}
                    </span>
                    {" / "}
                    {rpShort(fromGoal.targetAmount)}
                  </span>
                </div>
                <ProgressBar value={fromAfterPct} color={fromGoal.color} height={7} />
              </div>

              {/* To */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-body font-medium">
                    {toGoal.emoji} {toGoal.item}
                  </span>
                  <span className="text-muted tabular-nums">
                    <span className="text-pos-strong dark:text-pos-dark">
                      {rpShort(Math.min(toAfter, toGoal.targetAmount))}
                    </span>
                    {" / "}
                    {rpShort(toGoal.targetAmount)}
                  </span>
                </div>
                <ProgressBar value={toAfterPct} color={toGoal.color} height={7} />
              </div>
            </div>
          </div>
        )}

        {/* Warning over-target */}
        {willOver && (
          <div className="flex items-start gap-3 rounded-xl bg-amber-soft px-4 py-3 dark:bg-amber/10">
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0 text-amber-text dark:text-amber"
              aria-hidden="true"
            />
            <p className="text-body text-[13.5px] leading-relaxed">
              Asset tujuan akan{" "}
              <strong className="text-heading font-semibold">melebihi target</strong> sebesar{" "}
              <strong className="text-heading font-semibold">{rpShort(surplus)}</strong>. Tidak
              apa-apa — surplus akan tercatat.
            </p>
          </div>
        )}

        {/* Amount */}
        <CurrencyInput
          label="Jumlah transfer (Rp)"
          value={amount}
          onChange={setAmount}
          hint={fromGoal ? `Saldo tersedia: ${rpShort(fromGoal.usedAmount)}` : undefined}
        />

        {/* Date & Note */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Tanggal"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Catatan (opsional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="mis. rebalancing"
          />
        </div>

        {err && (
          <div
            role="alert"
            className="rounded-xl bg-neg-soft px-4 py-3 text-[13.5px] font-medium text-neg-strong dark:bg-neg/15 dark:text-neg-dark"
          >
            {err}
          </div>
        )}
      </div>
    </Modal>
  );
}
