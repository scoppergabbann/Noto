"use client";

import { useState, useMemo } from "react";
import { Plus, TrendingUp, Target, Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { rpShort, rpFull } from "@/lib/format";
import {
  targetFund,
  projectedFund,
  fundGap,
  requiredMonthlySaving,
  retirementProgress,
} from "@/lib/retirement";
import { useGoldStore, useStocksStore, useAssetsStore } from "@/lib/stores";
import { stockMarketValue, currentGoldValue, remainingGrams } from "@/lib/finance";

// ---- Local state types (belum Supabase — simpan di sessionStorage untuk sekarang)
interface Plan {
  currentAge: number;
  retirementAge: number;
  monthlyNeedToday: number;
  inflationRate: number;
  expectedReturn: number;
  lifeExpectancy: number;
}

interface Fund {
  id: string;
  name: string;
  type: "dplk" | "bpjs" | "savings" | "investment" | "property" | "other";
  currentValue: number;
  monthlyContribution: number;
}

const TYPE_LABELS: Record<Fund["type"], string> = {
  dplk: "DPLK",
  bpjs: "BPJS Ketenagakerjaan",
  savings: "Tabungan",
  investment: "Reksa Dana / Obligasi",
  property: "Properti",
  other: "Lainnya",
};

const TYPE_EMOJI: Record<Fund["type"], string> = {
  dplk: "🏦",
  bpjs: "🏛️",
  savings: "💰",
  investment: "📈",
  property: "🏠",
  other: "📦",
};

const DEFAULT_PLAN: Plan = {
  currentAge: 30,
  retirementAge: 55,
  monthlyNeedToday: 10_000_000,
  inflationRate: 5,
  expectedReturn: 8,
  lifeExpectancy: 25,
};

export default function RetirementPage() {
  const [plan, setPlan] = useState<Plan>(DEFAULT_PLAN);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [addingFund, setAddingFund] = useState(false);
  const [draft, setDraft] = useState<Omit<Fund, "id">>({
    name: "",
    type: "savings",
    currentValue: 0,
    monthlyContribution: 0,
  });

  // Koneksi ke aset yang sudah ada
  const goldItems = useGoldStore((s) => s.items);
  const stockItems = useStocksStore((s) => s.items);
  const assetItems = useAssetsStore((s) => s.items);

  const yearsToRetirement = Math.max(0, plan.retirementAge - plan.currentAge);

  // Hitung nilai aset yang sudah ada
  const linkedAssets = useMemo(() => {
    const goldValue = goldItems.reduce(
      (s, g) => s + currentGoldValue(g.boughtGrams, g.soldGrams, g.currentPricePerGram),
      0
    );
    const stockValue = stockItems.reduce((s, h) => s + stockMarketValue(h.lots, h.currentPrice), 0);
    const otherValue = assetItems.reduce((s, a) => s + a.currentValue, 0);
    return { goldValue, stockValue, otherValue, total: goldValue + stockValue + otherValue };
  }, [goldItems, stockItems, assetItems]);

  // Total dari dana pensiun manual + aset terhubung
  const manualTotal = funds.reduce((s, f) => s + f.currentValue, 0);
  const monthlyContribTotal = funds.reduce((s, f) => s + f.monthlyContribution, 0);
  const totalCurrentSavings = manualTotal + linkedAssets.total;

  // Kalkulasi utama
  const target = useMemo(
    () =>
      targetFund(
        plan.monthlyNeedToday,
        yearsToRetirement,
        plan.inflationRate,
        plan.lifeExpectancy,
        plan.expectedReturn
      ),
    [plan, yearsToRetirement]
  );

  const projected = useMemo(
    () =>
      projectedFund(
        totalCurrentSavings,
        monthlyContribTotal,
        yearsToRetirement,
        plan.expectedReturn
      ),
    [totalCurrentSavings, monthlyContribTotal, yearsToRetirement, plan.expectedReturn]
  );

  const gap = fundGap(target, projected);
  const progress = retirementProgress(projected, target);
  const required = requiredMonthlySaving(
    target,
    totalCurrentSavings,
    yearsToRetirement,
    plan.expectedReturn
  );

  const onTrack = gap >= 0;
  const shortfall = Math.max(0, -gap);

  function addFund() {
    if (!draft.name.trim() || draft.currentValue < 0) return;
    setFunds((prev) => [...prev, { ...draft, id: `f_${Date.now()}` }]);
    setDraft({ name: "", type: "savings", currentValue: 0, monthlyContribution: 0 });
    setAddingFund(false);
  }

  function removeFund(id: string) {
    setFunds((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <>
      <PageHeader
        eyebrow="Perencanaan Pensiun"
        title={
          <>
            Pensiunmu, <em className="italic text-amber-text dark:text-amber">terencana</em>.
          </>
        }
      />

      {/* Status banner */}
      <Card
        className={`mb-5 flex items-start gap-4 ${onTrack ? "!bg-pos-soft/60 dark:!bg-pos/[0.07]" : "!bg-neg-soft/60 dark:!bg-neg/[0.07]"}`}
      >
        <div
          className={`mt-0.5 shrink-0 ${onTrack ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark"}`}
        >
          {onTrack ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
        </div>
        <div>
          <div
            className={`text-[14px] font-bold ${onTrack ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark"}`}
          >
            {onTrack
              ? `On track! Proyeksi surplus ${rpShort(gap)}`
              : `Perlu ${rpShort(shortfall)} lagi untuk mencapai target`}
          </div>
          <div className="text-body mt-0.5 text-[13px]">
            {yearsToRetirement} tahun lagi menuju pensiun usia {plan.retirementAge}.
            {!onTrack && ` Tambah tabungan ${rpShort(required)}/bulan untuk on track.`}
          </div>
        </div>
      </Card>

      {/* Progress */}
      <Card className="mb-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-heading font-serif text-[18px] font-semibold sm:text-[20px]">
              Progres Dana Pensiun
            </h2>
            <p className="text-muted mt-0.5 text-[13px]">Proyeksi vs target saat pensiun</p>
          </div>
          <div className="text-right">
            <div
              className={`font-serif text-[22px] font-semibold tabular-nums sm:text-[26px] ${onTrack ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark"}`}
            >
              {progress}%
            </div>
            <Badge tone={onTrack ? "green" : "red"}>{onTrack ? "on track" : "perlu upaya"}</Badge>
          </div>
        </div>
        <ProgressBar
          value={progress}
          color={onTrack ? "#0f9d6b" : "#d83a3a"}
          height={12}
          label={`Progress pensiun ${progress}%`}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Target Dana", rpShort(target), "text-heading"],
            [
              "Proyeksi",
              rpShort(projected),
              onTrack ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark",
            ],
            ["Dana Kini", rpShort(totalCurrentSavings), "text-heading"],
            ["Nabung/bln", rpShort(monthlyContribTotal), "text-heading"],
          ].map(([label, value, cls]) => (
            <div key={label} className="rounded-xl bg-surface-sunken p-3 dark:bg-white/5">
              <div className="text-subtle text-[11.5px] font-semibold">{label}</div>
              <div className={`mt-0.5 font-serif text-[16px] font-semibold tabular-nums ${cls}`}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Parameter kalkulator */}
        <Card>
          <h2 className="text-heading mb-4 font-serif text-[18px] font-semibold sm:text-[20px]">
            Parameter Rencana
          </h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Usia sekarang"
                type="number"
                inputMode="numeric"
                value={plan.currentAge}
                onChange={(e) => setPlan({ ...plan, currentAge: Number(e.target.value) })}
              />
              <Input
                label="Target usia pensiun"
                type="number"
                inputMode="numeric"
                value={plan.retirementAge}
                onChange={(e) => setPlan({ ...plan, retirementAge: Number(e.target.value) })}
              />
            </div>
            <CurrencyInput
              label="Kebutuhan bulanan saat ini (Rp)"
              hint="Estimasi pengeluaran bulanan saat pensiun nanti (dalam nilai uang hari ini)"
              value={plan.monthlyNeedToday}
              onChange={(v) => setPlan({ ...plan, monthlyNeedToday: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Inflasi/tahun (%)"
                type="number"
                inputMode="decimal"
                hint="Rata-rata Indonesia ~5-6%"
                value={plan.inflationRate}
                onChange={(e) => setPlan({ ...plan, inflationRate: Number(e.target.value) })}
              />
              <Input
                label="Return investasi/tahun (%)"
                type="number"
                inputMode="decimal"
                hint="Reksa dana ~8-12%, deposito ~5%"
                value={plan.expectedReturn}
                onChange={(e) => setPlan({ ...plan, expectedReturn: Number(e.target.value) })}
              />
            </div>
            <Input
              label="Estimasi masa pensiun (tahun)"
              type="number"
              inputMode="numeric"
              hint={`Umur ${plan.retirementAge} sampai ${plan.retirementAge + plan.lifeExpectancy} tahun`}
              value={plan.lifeExpectancy}
              onChange={(e) => setPlan({ ...plan, lifeExpectancy: Number(e.target.value) })}
            />

            {/* Insight kalkulator */}
            <div className="rounded-xl border border-black/[.06] bg-surface-sunken p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-subtle mb-3 text-[12px] font-bold uppercase tracking-wide">
                Ringkasan kalkulasi
              </div>
              <div className="space-y-2 text-[13.5px]">
                <div className="flex justify-between">
                  <span className="text-muted">Kebutuhan saat pensiun/bln</span>
                  <span className="text-heading font-semibold tabular-nums">
                    {rpShort(
                      plan.monthlyNeedToday *
                        Math.pow(1 + plan.inflationRate / 100, yearsToRetirement)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Target total dana</span>
                  <span className="text-heading font-semibold tabular-nums">{rpShort(target)}</span>
                </div>
                <div className="flex justify-between border-t border-black/[.06] pt-2 dark:border-white/10">
                  <span className="text-muted font-medium">Perlu nabung/bulan</span>
                  <span
                    className={`font-bold tabular-nums ${required > 0 ? "text-neg-strong dark:text-neg-dark" : "text-pos-strong dark:text-pos-dark"}`}
                  >
                    {required > 0 ? rpShort(required) : "Sudah cukup! 🎉"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Sumber dana */}
        <div className="flex flex-col gap-4">
          {/* Aset terhubung otomatis */}
          <Card>
            <h2 className="text-heading mb-3 font-serif text-[18px] font-semibold sm:text-[20px]">
              Aset Terhubung
            </h2>
            <p className="text-muted mb-4 text-[13px]">
              Dihitung otomatis dari data Emas, Saham, dan Aset Lainnya kamu.
            </p>
            <ul className="space-y-2.5">
              {[
                ["🪙 Emas", linkedAssets.goldValue],
                ["📈 Saham", linkedAssets.stockValue],
                ["📦 Aset Lainnya", linkedAssets.otherValue],
              ].map(([label, value]) => (
                <li key={String(label)} className="flex items-center justify-between text-[13.5px]">
                  <span className="text-body">{label}</span>
                  <span className="text-heading font-semibold tabular-nums">
                    {rpShort(Number(value))}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between border-t border-black/[.06] pt-2.5 text-[14px] dark:border-white/10">
                <span className="text-heading font-semibold">Total aset terhubung</span>
                <span className="text-heading font-bold tabular-nums">
                  {rpShort(linkedAssets.total)}
                </span>
              </li>
            </ul>
          </Card>

          {/* Dana pensiun manual */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-heading font-serif text-[18px] font-semibold sm:text-[20px]">
                Sumber Dana Pensiun
              </h2>
              <Button size="sm" onClick={() => setAddingFund(true)}>
                <Plus size={15} strokeWidth={2.5} /> Tambah
              </Button>
            </div>

            {/* Form tambah dana */}
            {addingFund && (
              <div className="mb-4 rounded-xl border border-black/[.07] bg-surface-sunken p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-heading mb-3 text-[13px] font-bold">Tambah Sumber Dana</div>
                <div className="flex flex-col gap-3">
                  <Input
                    label="Nama"
                    placeholder="mis. DPLK BCA, Reksa Dana ABC"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                  <Select
                    label="Jenis"
                    value={draft.type}
                    onChange={(e) => setDraft({ ...draft, type: e.target.value as Fund["type"] })}
                  >
                    {Object.entries(TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                  <CurrencyInput
                    label="Nilai saat ini (Rp)"
                    value={draft.currentValue}
                    onChange={(v) => setDraft({ ...draft, currentValue: v })}
                  />
                  <CurrencyInput
                    label="Kontribusi bulanan (Rp)"
                    hint="0 jika tidak ada iuran rutin"
                    value={draft.monthlyContribution}
                    onChange={(v) => setDraft({ ...draft, monthlyContribution: v })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addFund} className="flex-1">
                      Simpan
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setAddingFund(false)}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {funds.length === 0 && !addingFund ? (
              <div className="py-8 text-center">
                <div className="mb-2 text-[36px]" aria-hidden="true">
                  🏦
                </div>
                <p className="text-muted text-[13.5px]">
                  Belum ada sumber dana khusus pensiun.
                  <br />
                  Tambahkan DPLK, BPJS, atau tabungan pensiun.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {funds.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-3 rounded-xl border border-black/[.05] p-3 dark:border-white/5"
                  >
                    <span className="text-[22px]" aria-hidden="true">
                      {TYPE_EMOJI[f.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-heading truncate text-[14px] font-semibold">
                        {f.name}
                      </div>
                      <div className="text-subtle text-[12px]">
                        {TYPE_LABELS[f.type]}
                        {f.monthlyContribution > 0 && ` · +${rpShort(f.monthlyContribution)}/bln`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-heading font-serif text-[15px] font-semibold tabular-nums">
                        {rpShort(f.currentValue)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFund(f.id)}
                      aria-label={`Hapus ${f.name}`}
                      className="grid h-11 w-11 shrink-0 touch-manipulation place-items-center rounded-xl text-ink-faint transition hover:bg-neg-soft hover:text-neg-strong dark:hover:bg-neg/15 dark:hover:text-neg-dark"
                    >
                      ×
                    </button>
                  </li>
                ))}
                <li className="flex items-center justify-between border-t border-black/[.06] pt-2.5 text-[14px] dark:border-white/10">
                  <span className="text-heading font-semibold">Total</span>
                  <span className="text-heading font-bold tabular-nums">
                    {rpShort(manualTotal)}
                  </span>
                </li>
              </ul>
            )}
          </Card>

          {/* Tips */}
          <Card className="!bg-amber-soft/40 dark:!bg-amber/[0.06]">
            <div className="flex items-start gap-3">
              <TrendingUp
                size={18}
                className="mt-0.5 shrink-0 text-amber-text dark:text-amber"
                aria-hidden="true"
              />
              <div className="text-body text-[13px] leading-relaxed">
                <strong className="text-heading font-bold">Tips:</strong> Aturan umum — dana pensiun
                ideal adalah <strong className="text-heading">25× pengeluaran tahunan</strong> (Rule
                of 25). Dengan inflasi 5% dan masa pensiun {plan.lifeExpectancy} tahun, target kamu{" "}
                <strong className="text-heading">{rpFull(Math.round(target))}</strong>.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
