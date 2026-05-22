"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { GoldAsset } from "@/types";

export type GoldDraft = Omit<GoldAsset, "id">;
const empty: GoldDraft = {
  item: "",
  category: "investment",
  boughtGrams: 0,
  soldGrams: 0,
  buyValue: 0,
  usedValue: 0,
  currentPricePerGram: 1_350_000,
  notes: "",
};

export function GoldForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: GoldDraft) => void;
  initial?: GoldAsset | null;
}) {
  const [d, setD] = useState<GoldDraft>(empty);
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
    if (d.boughtGrams <= 0) return setErr("Gram beli harus lebih dari 0.");
    if (d.soldGrams > d.boughtGrams) return setErr("Gram jual tidak boleh melebihi gram beli.");
    if (d.currentPricePerGram <= 0) return setErr("Harga kini per gram harus diisi.");
    onSubmit(d);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Emas" : "Catat Emas"}
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
          label="Nama"
          placeholder="mis. Emas Antam"
          value={d.item}
          onChange={(e) => setD({ ...d, item: e.target.value })}
        />
        <Select
          label="Kategori"
          value={d.category}
          onChange={(e) => setD({ ...d, category: e.target.value as GoldDraft["category"] })}
        >
          <option value="investment">Investment</option>
          <option value="savings">Savings</option>
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Total beli (gr)"
            type="number"
            inputMode="decimal"
            value={d.boughtGrams || ""}
            onChange={(e) => setD({ ...d, boughtGrams: Number(e.target.value) })}
          />
          <Input
            label="Total jual (gr)"
            type="number"
            inputMode="decimal"
            value={d.soldGrams || ""}
            onChange={(e) => setD({ ...d, soldGrams: Number(e.target.value) })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nilai saat beli (Rp)"
            type="number"
            inputMode="numeric"
            value={d.buyValue || ""}
            onChange={(e) => setD({ ...d, buyValue: Number(e.target.value) })}
          />
          <Input
            label="Nilai terjual (Rp)"
            type="number"
            inputMode="numeric"
            value={d.usedValue || ""}
            onChange={(e) => setD({ ...d, usedValue: Number(e.target.value) })}
          />
        </div>
        <Input
          label="Estimasi harga kini (Rp/gr)"
          type="number"
          inputMode="numeric"
          value={d.currentPricePerGram || ""}
          onChange={(e) => setD({ ...d, currentPricePerGram: Number(e.target.value) })}
        />
        <Input
          label="Catatan (opsional)"
          value={d.notes || ""}
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
