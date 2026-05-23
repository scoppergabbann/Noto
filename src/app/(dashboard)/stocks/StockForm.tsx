"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import {
  stockMarketValue,
  stockCostBasis,
  stockUnrealizedPL,
  stockUnrealizedPct,
} from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { StockHolding } from "@/types";

export type StockDraft = Omit<StockHolding, "id">;

const empty: StockDraft = {
  ticker: "",
  name: "",
  exchange: "IDX",
  lots: 0,
  avgPrice: 0,
  currentPrice: 0,
  dividendReceived: 0,
  notes: "",
};

const EXCHANGES = ["IDX", "NASDAQ", "NYSE", "SGX", "HKEX", "Lainnya"];

export function StockForm({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (d: StockDraft) => void;
  initial?: StockHolding | null;
}) {
  const [d, setD] = useState<StockDraft>(empty);
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
    if (!d.ticker.trim()) return setErr("Kode saham wajib diisi.");
    if (!d.name.trim()) return setErr("Nama perusahaan wajib diisi.");
    if (d.lots <= 0) return setErr("Jumlah lot harus lebih dari 0.");
    if (d.avgPrice <= 0) return setErr("Harga beli harus lebih dari 0.");
    if (d.currentPrice <= 0) return setErr("Harga kini harus lebih dari 0.");
    onSubmit(d);
    onClose();
  }

  const market = d.lots > 0 && d.currentPrice > 0 ? stockMarketValue(d.lots, d.currentPrice) : 0;
  const cost = d.lots > 0 && d.avgPrice > 0 ? stockCostBasis(d.lots, d.avgPrice) : 0;
  const upl = market > 0 && cost > 0 ? stockUnrealizedPL(d.lots, d.avgPrice, d.currentPrice) : 0;
  const uplPct = d.avgPrice > 0 ? stockUnrealizedPct(d.avgPrice, d.currentPrice) : 0;
  const isUp = upl >= 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Saham" : "Tambah Saham"}
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
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Kode Saham"
            placeholder="mis. BBCA, TLKM"
            value={d.ticker}
            onChange={(e) => setD({ ...d, ticker: e.target.value.toUpperCase() })}
          />
          <Select
            label="Bursa"
            value={d.exchange}
            onChange={(e) => setD({ ...d, exchange: e.target.value })}
          >
            {EXCHANGES.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Nama Perusahaan"
          placeholder="mis. Bank Central Asia Tbk"
          value={d.name}
          onChange={(e) => setD({ ...d, name: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-heading mb-1.5 block text-[13.5px] font-semibold">
              Jumlah Lot
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={d.lots || ""}
              onChange={(e) => setD({ ...d, lots: Number(e.target.value) })}
              placeholder="mis. 10"
              className="text-heading placeholder:text-subtle w-full rounded-xl border border-black/[.08] bg-white px-4 py-2.5 text-[14.5px] font-semibold tabular-nums outline-none transition placeholder:font-normal focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            {d.lots > 0 && (
              <p className="text-subtle mt-1 text-[12px]">
                = {(d.lots * 100).toLocaleString("id-ID")} lembar
              </p>
            )}
          </div>
          <CurrencyInput
            label="Harga Beli / lembar (Rp)"
            value={d.avgPrice}
            onChange={(val) => setD({ ...d, avgPrice: val })}
          />
        </div>
        <CurrencyInput
          label="Harga Kini / lembar (Rp)"
          value={d.currentPrice}
          onChange={(val) => setD({ ...d, currentPrice: val })}
        />
        <CurrencyInput
          label="Total Dividen Diterima (Rp)"
          value={d.dividendReceived}
          onChange={(val) => setD({ ...d, dividendReceived: val })}
        />
        {market > 0 && (
          <div className="rounded-xl bg-surface-sunken p-3.5 dark:bg-white/5">
            <div className="text-subtle mb-2 text-[12px] font-bold uppercase tracking-wide">
              Preview
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["Modal", rpShort(cost), ""],
                ["Nilai Pasar", rpShort(market), ""],
                [
                  "P&L",
                  `${isUp ? "+" : ""}${uplPct}%`,
                  isUp
                    ? "text-pos-strong dark:text-pos-dark"
                    : "text-neg-strong dark:text-neg-dark",
                ],
              ].map(([label, value, cls]) => (
                <div key={label} className="rounded-lg bg-white p-2 dark:bg-white/5">
                  <div className="text-subtle text-[11px]">{label}</div>
                  <div className={`text-heading font-serif text-[16px] font-semibold ${cls}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
