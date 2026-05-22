"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CreditCard } from "@/types";

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
    } else setD(empty);
    setErr("");
  }, [initial, open]);

  function submit() {
    if (!d.name.trim()) return setErr("Nama kartu wajib diisi.");
    if (d.creditLimit <= 0) return setErr("Limit harus lebih dari 0.");
    if (d.spent > d.creditLimit) return setErr("Pemakaian tidak boleh melebihi creditLimit.");
    onSubmit(d);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Kartu" : "Kartu Baru"}
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
          label="Nama kartu"
          placeholder="mis. BCA Mastercard"
          value={d.name}
          onChange={(e) => setD({ ...d, name: e.target.value })}
        />
        <Input
          label="4 digit terakhir"
          placeholder="4821"
          maxLength={4}
          value={d.last4}
          onChange={(e) => setD({ ...d, last4: e.target.value.replace(/\D/g, "") })}
        />
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Limit (Rp)"
            type="number"
            inputMode="numeric"
            value={d.creditLimit || ""}
            onChange={(e) => setD({ ...d, creditLimit: Number(e.target.value) })}
          />
          <Input
            label="Pemakaian"
            type="number"
            inputMode="numeric"
            value={d.spent || ""}
            onChange={(e) => setD({ ...d, spent: Number(e.target.value) })}
          />
          <Input
            label="Dibayar"
            type="number"
            inputMode="numeric"
            value={d.paid || ""}
            onChange={(e) => setD({ ...d, paid: Number(e.target.value) })}
          />
        </div>
        <div>
          <div className="mb-1.5 text-[13px] font-medium text-ink-dim dark:text-slate-400">
            Warna kartu
          </div>
          <div className="flex gap-2">
            {GRADIENTS.map((g) => (
              <button
                key={g}
                onClick={() => setD({ ...d, gradient: g })}
                aria-label="warna"
                className={`h-10 w-14 rounded-lg transition ${d.gradient === g ? "ring-2 ring-ink/40 ring-offset-2 dark:ring-offset-[#16171c]" : ""}`}
                style={{ background: g }}
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
