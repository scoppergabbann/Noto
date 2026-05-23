"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { monthlyInstallment } from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { Debt } from "@/types";

export type DebtDraft = Omit<Debt, "id">;

const empty: DebtDraft = {
  item: "",
  creditor: "",
  total: 0,
  paid: 0,
  dueDate: "",
  interestType: "none",
  interestRate: 0,
  notes: "",
};

export function DebtForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: DebtDraft) => void;
  initial?: Debt | null;
}) {
  const [d, setD] = useState<DebtDraft>(empty);
  const [months, setMonths] = useState(12);
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

  function submit() {
    if (!d.item.trim()) return setErr("Nama wajib diisi.");
    if (d.total <= 0) return setErr("Total harus lebih dari 0.");
    if (d.paid > d.total) return setErr("Dibayar tidak boleh melebihi total.");
    if (d.interestRate < 0) return setErr("Bunga tidak boleh negatif.");
    onSubmit(d);
    onClose();
  }

  const hasInterest = d.interestType !== "none" && d.interestRate > 0;
  const installment = hasInterest
    ? monthlyInstallment(d.total - d.paid, d.interestRate, months)
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Utang" : "Catat Utang Baru"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit}>{initial ? "Simpan" : "Tambah"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <Input
          label="Nama utang / cicilan"
          placeholder="mis. KPR, KTA, pinjam teman"
          value={d.item}
          onChange={(e) => setD({ ...d, item: e.target.value })}
        />

        <Input
          label="Kepada siapa (opsional)"
          placeholder="Bank, teman, dll."
          value={d.creditor}
          onChange={(e) => setD({ ...d, creditor: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput
            label="Total utang (Rp)"
            value={d.total}
            onChange={(val) => setD({ ...d, total: val })}
          />
          <CurrencyInput
            label="Sudah dibayar (Rp)"
            value={d.paid}
            onChange={(val) => setD({ ...d, paid: val })}
          />
        </div>

        {/* Bunga */}
        <div className="rounded-xl border border-black/[.07] p-3.5 dark:border-white/10">
          <div className="text-heading mb-2.5 text-[13px] font-bold">Bunga</div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Jenis bunga"
              value={d.interestType}
              onChange={(e) => setD({ ...d, interestType: e.target.value as Debt["interestType"] })}
            >
              <option value="none">Tanpa bunga</option>
              <option value="flat">Flat (dari pokok awal)</option>
              <option value="floating">Floating (dari sisa pokok)</option>
            </Select>

            {d.interestType !== "none" && (
              <Input
                label="Bunga per bulan (%)"
                type="number"
                inputMode="decimal"
                placeholder="mis. 1.5"
                value={d.interestRate || ""}
                onChange={(e) => setD({ ...d, interestRate: Number(e.target.value) })}
              />
            )}
          </div>

          {hasInterest && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input
                label="Sisa tenor (bulan)"
                type="number"
                inputMode="numeric"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
              />
              {installment && (
                <div className="flex flex-col justify-end pb-0.5">
                  <div className="text-subtle text-[11.5px] font-semibold">Est. cicilan/bulan</div>
                  <div className="font-serif text-[22px] font-semibold text-neg-strong dark:text-neg-dark">
                    {rpShort(installment)}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasInterest && (
            <div className="mt-2.5 rounded-lg bg-neg-soft px-3 py-2 text-[12.5px] text-neg-strong dark:bg-neg/10 dark:text-neg-dark">
              {d.interestType === "flat"
                ? `Bunga dihitung dari pokok awal Rp${d.total.toLocaleString("id-ID")} setiap bulan.`
                : `Bunga dihitung dari sisa pokok Rp${(d.total - d.paid).toLocaleString("id-ID")} (menurun seiring pembayaran).`}
            </div>
          )}
        </div>

        <Input
          label="Jatuh tempo"
          type="date"
          value={d.dueDate}
          onChange={(e) => setD({ ...d, dueDate: e.target.value })}
        />

        <Input
          label="Catatan (opsional)"
          value={d.notes ?? ""}
          onChange={(e) => setD({ ...d, notes: e.target.value })}
        />

        {err && (
          <div className="rounded-lg bg-neg-soft px-3 py-2 text-[13px] font-medium text-neg-strong dark:bg-neg/15 dark:text-neg-dark">
            {err}
          </div>
        )}
      </div>
    </Modal>
  );
}
