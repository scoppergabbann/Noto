"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { OtherAsset } from "@/types";

export type AssetDraft = Omit<OtherAsset, "id">;
const EMOJIS = ["🛵", "🚗", "📱", "💻", "📈", "🏠", "⌚", "🎸", "📦"];
const empty: AssetDraft = {
  item: "",
  unit: "unit",
  quantity: 1,
  currentValue: 0,
  emoji: "📦",
  notes: "",
};

export function AssetForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: AssetDraft) => void;
  initial?: OtherAsset | null;
}) {
  const [d, setD] = useState<AssetDraft>(empty);
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
    if (!d.item.trim()) return setErr("Nama aset wajib diisi.");
    if (d.currentValue < 0) return setErr("Nilai tidak boleh negatif.");
    onSubmit(d);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Aset" : "Aset Baru"}
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
          label="Nama aset"
          placeholder="mis. Motor Vario"
          value={d.item}
          onChange={(e) => setD({ ...d, item: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Jumlah"
            type="number"
            inputMode="numeric"
            value={d.quantity || ""}
            onChange={(e) => setD({ ...d, quantity: Number(e.target.value) })}
          />
          <Input
            label="Satuan"
            placeholder="unit / lot / gr"
            value={d.unit}
            onChange={(e) => setD({ ...d, unit: e.target.value })}
          />
        </div>
        <Input
          label="Nilai saat ini (Rp)"
          type="number"
          inputMode="numeric"
          value={d.currentValue || ""}
          onChange={(e) => setD({ ...d, currentValue: Number(e.target.value) })}
        />
        <Input
          label="Catatan (opsional)"
          value={d.notes || ""}
          onChange={(e) => setD({ ...d, notes: e.target.value })}
        />
        <div>
          <div className="mb-1.5 text-[13px] font-medium text-ink-dim dark:text-slate-400">
            Ikon
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((em) => (
              <button
                key={em}
                onClick={() => setD({ ...d, emoji: em })}
                className={`grid h-9 w-9 place-items-center rounded-lg text-[18px] transition ${d.emoji === em ? "bg-amber/20 ring-2 ring-amber" : "bg-black/[.04] dark:bg-white/10"}`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
        {err && (
          <div className="bg-brand-red/10 text-brand-red rounded-lg px-3 py-2 text-[13px] font-medium">
            {err}
          </div>
        )}
      </div>
    </Modal>
  );
}
