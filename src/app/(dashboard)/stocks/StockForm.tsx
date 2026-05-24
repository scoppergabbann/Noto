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
  broker: "",
  lots: 0,
  avgPrice: 0,
  currentPrice: 0,
  dividendReceived: 0,
  targetPrice: 0,
  buyReason: "",
  exitPlan: "",
  conviction: 3,
  notes: "",
};

const EXCHANGES = ["IDX", "NASDAQ", "NYSE", "SGX", "HKEX", "Lainnya"];
const CONVICTION_LABELS = ["", "Sangat Rendah", "Rendah", "Sedang", "Tinggi", "Sangat Tinggi"];

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
  const [tab, setTab] = useState<"data" | "journal">("data");

  useEffect(() => {
    if (initial) {
      const { id: _id, ...rest } = initial;
      void _id;
      setD(rest);
    } else {
      setD(empty);
    }
    setErr("");
    setTab("data");
  }, [initial, open]);

  function submit() {
    if (!d.ticker.trim()) return setErr("Kode saham wajib diisi.");
    if (!d.name.trim()) return setErr("Nama perusahaan wajib diisi.");
    if (d.lots <= 0) return setErr("Jumlah lot harus lebih dari 0.");
    if (d.avgPrice <= 0) return setErr("Harga beli harus lebih dari 0.");
    if (d.currentPrice <= 0) return setErr("Harga kini harus lebih dari 0.");
    if (d.conviction < 1 || d.conviction > 5) return setErr("Conviction 1–5.");
    onSubmit(d);
    onClose();
  }

  // Preview P&L
  const market = d.lots > 0 && d.currentPrice > 0 ? stockMarketValue(d.lots, d.currentPrice) : 0;
  const cost = d.lots > 0 && d.avgPrice > 0 ? stockCostBasis(d.lots, d.avgPrice) : 0;
  const upl = market > 0 && cost > 0 ? stockUnrealizedPL(d.lots, d.avgPrice, d.currentPrice) : 0;
  const uplPct = d.avgPrice > 0 ? stockUnrealizedPct(d.avgPrice, d.currentPrice) : 0;
  const isUp = upl >= 0;

  // Potensi gain ke target
  const targetGain =
    d.targetPrice > 0 && d.currentPrice > 0
      ? Math.round(((d.targetPrice - d.currentPrice) / d.currentPrice) * 100 * 10) / 10
      : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Saham" : "Tambah Saham"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Batal
          </Button>
          <Button onClick={submit} className="w-full sm:w-auto">
            {initial ? "Simpan" : "Tambah"}
          </Button>
        </>
      }
    >
      {/* Tab switcher */}
      <div className="mb-5 flex gap-1 rounded-xl bg-surface-sunken p-1 dark:bg-white/5">
        {(["data", "journal"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex min-h-[36px] flex-1 items-center justify-center rounded-[10px] text-[13.5px] font-semibold transition ${
              tab === t
                ? "bg-white text-ink shadow-soft dark:bg-white/10 dark:text-slate-100"
                : "text-muted hover:text-heading"
            }`}
          >
            {t === "data" ? "📊 Data Saham" : "📓 Investment Journal"}
          </button>
        ))}
      </div>

      {tab === "data" && (
        <div className="flex flex-col gap-4">
          {/* Identitas */}
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

          <Input
            label="Broker / Sekuritas"
            placeholder="mis. Stockbit, Mirae, Pluang"
            value={d.broker}
            onChange={(e) => setD({ ...d, broker: e.target.value })}
          />

          {/* Posisi */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-heading text-[13.5px] font-semibold">Jumlah Lot</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={d.lots || ""}
                onChange={(e) => setD({ ...d, lots: Number(e.target.value) })}
                placeholder="mis. 10"
                className="text-heading placeholder:text-subtle min-h-[44px] w-full touch-manipulation rounded-xl border border-black/[.08] bg-white px-4 py-3 text-[15px] font-semibold tabular-nums outline-none transition placeholder:font-normal focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              {d.lots > 0 && (
                <p className="text-subtle text-[12px]">
                  = {(d.lots * 100).toLocaleString("id-ID")} lembar
                </p>
              )}
            </div>
            <CurrencyInput
              label="Harga Beli / lembar (Rp)"
              value={d.avgPrice}
              onChange={(v) => setD({ ...d, avgPrice: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CurrencyInput
              label="Harga Kini / lembar (Rp)"
              value={d.currentPrice}
              onChange={(v) => setD({ ...d, currentPrice: v })}
            />
            <CurrencyInput
              label="Total Dividen Diterima (Rp)"
              value={d.dividendReceived}
              onChange={(v) => setD({ ...d, dividendReceived: v })}
            />
          </div>

          {/* Preview P&L */}
          {market > 0 && (
            <div className="rounded-xl bg-surface-sunken p-4 dark:bg-white/5">
              <p className="text-subtle mb-3 text-[12px] font-bold uppercase tracking-wide">
                Preview Posisi
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ["Modal", rpShort(cost), "text-heading"],
                  ["Nilai Pasar", rpShort(market), "text-heading"],
                  [
                    "P&L",
                    `${isUp ? "+" : ""}${uplPct}%`,
                    isUp
                      ? "text-pos-strong dark:text-pos-dark"
                      : "text-neg-strong dark:text-neg-dark",
                  ],
                ].map(([label, value, cls]) => (
                  <div key={label} className="rounded-lg bg-white p-2.5 dark:bg-white/5">
                    <div className="text-subtle text-[11px]">{label}</div>
                    <div className={`font-serif text-[16px] font-semibold ${cls}`}>{value}</div>
                  </div>
                ))}
              </div>
              {upl !== 0 && (
                <p
                  className={`mt-2.5 text-center text-[13px] font-semibold ${isUp ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark"}`}
                >
                  {isUp ? "+" : ""}
                  {rpShort(upl)} unrealized
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "journal" && (
        <div className="flex flex-col gap-4">
          <CurrencyInput
            label="Target Harga / lembar (Rp)"
            hint={
              targetGain !== null
                ? `Potensi gain: ${targetGain > 0 ? "+" : ""}${targetGain}% dari harga kini`
                : "Harga target jual kamu"
            }
            value={d.targetPrice}
            onChange={(v) => setD({ ...d, targetPrice: v })}
          />

          {/* Conviction slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-heading text-[13.5px] font-semibold">Conviction Level</label>
              <span
                className={`rounded-lg px-2.5 py-1 text-[12.5px] font-bold ${
                  d.conviction >= 4
                    ? "bg-pos-soft text-pos-strong dark:bg-pos/15 dark:text-pos-dark"
                    : d.conviction >= 3
                      ? "bg-amber-soft text-amber-text dark:bg-amber/15 dark:text-amber"
                      : "bg-neg-soft text-neg-strong dark:bg-neg/15 dark:text-neg-dark"
                }`}
              >
                {d.conviction}/5 · {CONVICTION_LABELS[d.conviction]}
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setD({ ...d, conviction: n })}
                  className={`flex h-11 flex-1 touch-manipulation items-center justify-center rounded-xl text-[15px] font-bold transition ${
                    n <= d.conviction
                      ? "bg-amber text-white"
                      : "text-subtle bg-surface-sunken dark:bg-white/5"
                  }`}
                  aria-label={`Conviction ${n} dari 5`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-subtle text-[12px]">1 = sangat tidak yakin · 5 = sangat yakin</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-heading text-[13.5px] font-semibold">Alasan Beli</label>
            <textarea
              value={d.buyReason}
              onChange={(e) => setD({ ...d, buyReason: e.target.value })}
              placeholder="mis. Fundamental kuat, ROE konsisten, valuasi murah saat dibeli..."
              rows={3}
              className="text-heading placeholder:text-subtle w-full resize-none rounded-xl border border-black/[.08] bg-white px-4 py-3 text-[15px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white sm:text-[14.5px]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-heading text-[13.5px] font-semibold">Exit Plan</label>
            <textarea
              value={d.exitPlan}
              onChange={(e) => setD({ ...d, exitPlan: e.target.value })}
              placeholder="mis. Jual saat mencapai target harga, atau kalau fundamental berubah..."
              rows={3}
              className="text-heading placeholder:text-subtle w-full resize-none rounded-xl border border-black/[.08] bg-white px-4 py-3 text-[15px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white sm:text-[14.5px]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-heading text-[13.5px] font-semibold">Catatan Pribadi</label>
            <textarea
              value={d.notes ?? ""}
              onChange={(e) => setD({ ...d, notes: e.target.value })}
              placeholder="Catatan bebas, pengingat, atau observasi pasar..."
              rows={3}
              className="text-heading placeholder:text-subtle w-full resize-none rounded-xl border border-black/[.08] bg-white px-4 py-3 text-[15px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5 dark:text-white sm:text-[14.5px]"
            />
          </div>
        </div>
      )}

      {err && (
        <div
          role="alert"
          className="mt-4 rounded-xl bg-neg-soft px-4 py-3 text-[13.5px] font-medium text-neg-strong dark:bg-neg/15 dark:text-neg-dark"
        >
          {err}
        </div>
      )}
    </Modal>
  );
}
