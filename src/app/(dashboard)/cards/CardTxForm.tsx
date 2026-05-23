"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import type { CardTransaction } from "@/types";

export type CardTxDraft = Omit<CardTransaction, "id">;

const CARD_CATEGORIES = [
  "Makan & Minum",
  "Belanja",
  "Transport",
  "Tagihan",
  "Hiburan",
  "Kesehatan",
  "Perjalanan",
  "Elektronik",
  "Lainnya",
];
const today = () => new Date().toISOString().slice(0, 10);

export function CardTxForm({
  open,
  onClose,
  onSubmit,
  cardId,
  cardName,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: CardTxDraft) => void;
  cardId: string;
  cardName: string;
  initial?: CardTransaction | null;
}) {
  const [d, setD] = useState<CardTxDraft>({
    cardId,
    merchant: "",
    category: "Belanja",
    amount: 0,
    date: today(),
    note: "",
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (initial) {
      const { id: _id, ...rest } = initial;
      void _id;
      setD(rest);
    } else setD({ cardId, merchant: "", category: "Belanja", amount: 0, date: today(), note: "" });
    setErr("");
  }, [initial, open, cardId]);

  function submit() {
    if (!d.merchant.trim()) return setErr("Nama merchant wajib diisi.");
    if (d.amount <= 0) return setErr("Nominal harus lebih dari 0.");
    onSubmit(d);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Transaksi" : `Transaksi · ${cardName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit}>{initial ? "Simpan" : "Catat"}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <Input
          label="Merchant / toko"
          placeholder="mis. Indomaret, Netflix, Gojek"
          value={d.merchant}
          onChange={(e) => setD({ ...d, merchant: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Kategori"
            value={d.category}
            onChange={(e) => setD({ ...d, category: e.target.value })}
          >
            {CARD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input
            label="Tanggal"
            type="date"
            value={d.date}
            onChange={(e) => setD({ ...d, date: e.target.value })}
          />
        </div>
        <CurrencyInput
          label="Nominal (Rp)"
          value={d.amount}
          onChange={(val) => setD({ ...d, amount: val })}
        />
        <Input
          label="Catatan (opsional)"
          value={d.note ?? ""}
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
