"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { monthlyInstallment } from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { Receivable } from "@/types";

export type ReceivableDraft = Omit<Receivable, "id">;

const empty: ReceivableDraft = {
  item: "",
  debtor: "",
  total: 0,
  paid: 0,
  dueDate: "",
  interestType: "none",
  interestRate: 0,
  notes: "",
};

export function ReceivableForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: ReceivableDraft) => void;
  initial?: Receivable | null;
}) {
  const [d, setD] = useState<ReceivableDraft>(empty);
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
      title={initial ? "Edit Piutang" : "Piutang Baru"}
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
          label="Nama piutang / keperluan"
          placeholder="mis. Pinjaman ke Andi"
          value={d.item}
          onChange={(e) => setD({ ...d, item: e.target.value })}
        />

        <Input
          label="Nama peminjam (opsional)"
          placeholder="Nama orang / pihak"
          value={d.debtor}
          onChange={(e) => setD({ ...d, debtor: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput
            label="Total piutang (Rp)"
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
          <div className="text-heading mb-2.5 text-[13px] font-bold">Bunga (opsional)</div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Jenis bunga"
              value={d.interestType}
              onChange={(e) =>
                setD({ ...d, interestType: e.target.value as Receivable["interestType"] })
              }
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
                placeholder="mis. 2"
                value={d.interestRate || ""}
                onChange={(e) => setD({ ...d, interestRate: Number(e.target.value) })}
              />
            )}
          </div>

          {hasInterest && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input
                label="Estimasi durasi (bulan)"
                type="number"
                inputMode="numeric"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
              />
              {installment && (
                <div className="flex flex-col justify-end pb-0.5">
                  <div className="text-subtle text-[11.5px] font-semibold">Est. angsuran/bulan</div>
                  <div className="font-serif text-[22px] font-semibold text-pos-strong dark:text-pos-dark">
                    {rpShort(installment)}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasInterest && (
            <div className="mt-2.5 rounded-lg bg-pos-soft px-3 py-2 text-[12.5px] text-pos-strong dark:bg-pos/10 dark:text-pos-dark">
              {d.interestType === "flat"
                ? `Bunga flat dari pokok awal ${rpShort(d.total)} setiap bulan.`
                : `Bunga menurun dari sisa pokok ${rpShort(d.total - d.paid)} (berkurang seiring pembayaran).`}
            </div>
          )}
        </div>

        <Input
          label="Jatuh tempo (opsional)"
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
