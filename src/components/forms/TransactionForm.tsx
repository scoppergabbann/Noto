"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { expenseCategories, incomeCategories } from "@/data/mock";
import type { Transaction } from "@/types";
import { CurrencyInput } from "@/components/ui/CurrencyInput";

export type TxDraft = Omit<Transaction, "id">;

function today() {
  return new Date().toISOString().slice(0, 10);
}
const empty: TxDraft = {
  type: "expense",
  category: "Makan & Minum",
  amount: 0,
  date: today(),
  note: "",
};

export function TransactionForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: TxDraft) => void;
  initial?: Transaction | null;
}) {
  const [d, setD] = useState<TxDraft>(empty);
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

  const cats = d.type === "expense" ? expenseCategories : incomeCategories;

  function setType(type: "income" | "expense") {
    const list = type === "expense" ? expenseCategories : incomeCategories;
    setD((p) => ({ ...p, type, category: list[0].name }));
  }

  function submit() {
    if (d.amount <= 0) return setErr("Nominal harus lebih dari 0.");
    if (!d.date) return setErr("Tanggal wajib diisi.");
    onSubmit(d);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Transaksi" : "Catat Transaksi"}
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
        {/* type toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-sunken p-1 dark:bg-white/5">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg py-2 text-[13.5px] font-semibold transition ${
                d.type === t
                  ? t === "expense"
                    ? "bg-neg text-white shadow-sm"
                    : "bg-pos text-white shadow-sm"
                  : "text-muted hover:text-heading"
              }`}
            >
              {t === "expense" ? "Pengeluaran" : "Pemasukan"}
            </button>
          ))}
        </div>
        <CurrencyInput
          label="Nominal (Rp)"
          value={d.amount}
          onChange={(val) => setD({ ...d, amount: val })}
        />
        <Select
          label="Kategori"
          value={d.category}
          onChange={(e) => setD({ ...d, category: e.target.value })}
        >
          {cats.map((c) => (
            <option key={c.name} value={c.name}>
              {c.emoji} {c.name}
            </option>
          ))}
        </Select>
        <Input
          label="Tanggal"
          type="date"
          value={d.date}
          onChange={(e) => setD({ ...d, date: e.target.value })}
        />
        <Input
          label="Catatan (opsional)"
          value={d.note || ""}
          onChange={(e) => setD({ ...d, note: e.target.value })}
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
