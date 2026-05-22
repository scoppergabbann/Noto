"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Debt } from "@/types";

export type DebtDraft = Omit<Debt, "id">;
const empty: DebtDraft = { item: "", creditor: "", total: 0, paid: 0, dueDate: "", notes: "" };

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
    if (!d.item.trim()) return setErr("Nama wajib diisi.");
    if (d.total <= 0) return setErr("Total harus lebih dari 0.");
    if (d.paid > d.total) return setErr("Dibayar tidak boleh melebihi total.");
    onSubmit(d);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Utang" : "Utang Baru"}
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
          label="Nama utang/cicilan"
          placeholder="mis. Cicilan Laptop"
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
          <Input
            label="Total (Rp)"
            type="number"
            inputMode="numeric"
            value={d.total || ""}
            onChange={(e) => setD({ ...d, total: Number(e.target.value) })}
          />
          <Input
            label="Sudah dibayar (Rp)"
            type="number"
            inputMode="numeric"
            value={d.paid || ""}
            onChange={(e) => setD({ ...d, paid: Number(e.target.value) })}
          />
        </div>
        <Input
          label="Jatuh tempo"
          placeholder="mis. tgl 20"
          value={d.dueDate}
          onChange={(e) => setD({ ...d, dueDate: e.target.value })}
        />
        <Input
          label="Catatan (opsional)"
          value={d.notes ?? ""}
          onChange={(e) => setD({ ...d, notes: e.target.value })}
        />
        {err && (
          <div className="rounded-lg bg-brand-red/10 px-3 py-2 text-[13px] font-medium text-brand-red">
            {err}
          </div>
        )}
      </div>
    </Modal>
  );
}
