"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, TrendingUp, AlertCircle, CheckCircle, Trash2, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { rpShort } from "@/lib/format";
import {
  targetFund,
  projectedFund,
  fundGap,
  requiredMonthlySaving,
  retirementProgress,
} from "@/lib/retirement";
import {
  useRetirementPlansStore,
  useRetirementFundsStore,
  useGoldStore,
  useStocksStore,
  useAssetsStore,
} from "@/lib/stores";
import { stockMarketValue, currentGoldValue } from "@/lib/finance";
import type { RetirementPlan, RetirementFund } from "@/types";

const TYPE_LABELS: Record<RetirementFund["type"], string> = {
  dplk: "DPLK",
  bpjs: "BPJS Ketenagakerjaan",
  savings: "Tabungan Khusus",
  investment: "Reksa Dana / Obligasi",
  property: "Properti",
  other: "Lainnya",
};

const TYPE_EMOJI: Record<RetirementFund["type"], string> = {
  dplk: "🏦",
  bpjs: "🏛️",
  savings: "💰",
  investment: "📈",
  property: "🏠",
  other: "📦",
};

const DEFAULT_PLAN: Omit<RetirementPlan, "id"> = {
  label: "Rencana Pensiun Utama",
  currentAge: 30,
  retirementAge: 55,
  monthlyNeedToday: 10_000_000,
  inflationRate: 5,
  expectedReturn: 8,
  lifeExpectancy: 25,
  notes: "",
};

export default function RetirementPage() {
  const {
    items: plans,
    loading: plansLoading,
    error: plansError,
    fetch: fetchPlans,
    add: addPlan,
    update: updatePlan,
  } = useRetirementPlansStore();

  const {
    items: funds,
    loading: fundsLoading,
    error: fundsError,
    fetch: fetchFunds,
    add: addFund,
    remove: removeFund,
  } = useRetirementFundsStore();

  const goldItems = useGoldStore((s) => s.items);
  const stockItems = useStocksStore((s) => s.items);
  const assetItems = useAssetsStore((s) => s.items);

  // Local edit state (syncs to Supabase on save)
  const [editPlan, setEditPlan] = useState<Omit<RetirementPlan, "id"> | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingFund, setAddingFund] = useState(false);
  const [deleteFundId, setDeleteFundId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<RetirementFund, "id">>({
    planId: "",
    name: "",
    type: "savings",
    currentValue: 0,
    monthlyContribution: 0,
  });

  // Use first plan (atau buat baru)
  const plan = plans[0];

  // Sync plan ke edit state ketika data datang
  useEffect(() => {
    if (plan && !editPlan) {
      const { id: _id, ...rest } = plan;
      void _id;
      setEditPlan(rest);
    } else if (!plan && !editPlan) {
      setEditPlan(DEFAULT_PLAN);
    }
  }, [plan, editPlan]);

  function handlePlanChange(patch: Partial<typeof editPlan>) {
    setEditPlan((p) => (p ? { ...p, ...patch } : p));
    setIsDirty(true);
  }

  async function savePlan() {
    if (!editPlan) return;
    setSaving(true);
    if (plan) {
      await updatePlan(plan.id, editPlan);
    } else {
      await addPlan(editPlan);
      await fetchPlans();
    }
    setSaving(false);
    setIsDirty(false);
  }

  async function handleAddFund() {
    if (!draft.name.trim()) return;
    const planId = plan?.id ?? "";
    await addFund({ ...draft, planId });
    setDraft({ planId: "", name: "", type: "savings", currentValue: 0, monthlyContribution: 0 });
    setAddingFund(false);
    await fetchFunds();
  }

  // Linked assets
  const linkedAssets = useMemo(() => {
    const goldValue = goldItems.reduce(
      (s, g) => s + currentGoldValue(g.boughtGrams, g.soldGrams, g.currentPricePerGram),
      0
    );
    const stockValue = stockItems.reduce((s, h) => s + stockMarketValue(h.lots, h.currentPrice), 0);
    const otherValue = assetItems.reduce((s, a) => s + a.currentValue, 0);
    return { goldValue, stockValue, otherValue, total: goldValue + stockValue + otherValue };
  }, [goldItems, stockItems, assetItems]);

  const planFunds = funds.filter((f) => !plan || f.planId === plan.id);
  const manualTotal = planFunds.reduce((s, f) => s + f.currentValue, 0);
  const monthlyContribTotal = planFunds.reduce((s, f) => s + f.monthlyContribution, 0);
  const totalCurrentSavings = manualTotal + linkedAssets.total;

  const ep = editPlan ?? DEFAULT_PLAN;
  const yearsToRetirement = Math.max(0, ep.retirementAge - ep.currentAge);

  const target = useMemo(
    () =>
      targetFund(
        ep.monthlyNeedToday,
        yearsToRetirement,
        ep.inflationRate,
        ep.lifeExpectancy,
        ep.expectedReturn
      ),
    [ep, yearsToRetirement]
  );

  const projected = projectedFund(
    totalCurrentSavings,
    monthlyContribTotal,
    yearsToRetirement,
    ep.expectedReturn
  );

  const gap = fundGap(target, projected);
  const progress = retirementProgress(projected, target);
  const required = requiredMonthlySaving(
    target,
    totalCurrentSavings,
    yearsToRetirement,
    ep.expectedReturn
  );
  const onTrack = gap >= 0;
  const shortfall = Math.max(0, -gap);
  const monthlyAtRetirement =
    ep.monthlyNeedToday * Math.pow(1 + ep.inflationRate / 100, yearsToRetirement);

  if (plansLoading || fundsLoading) return <LoadingState label="Memuat rencana pensiun…" />;
  if (plansError) return <ErrorState message={plansError} onRetry={fetchPlans} />;
  if (fundsError) return <ErrorState message={fundsError} onRetry={fetchFunds} />;

  return (
    <>
      <PageHeader
        eyebrow="Perencanaan Pensiun"
        title={
          <>
            Pensiunmu, <em className="italic text-amber-text dark:text-amber">terencana</em>.
          </>
        }
        action={
          isDirty ? (
            <Button onClick={savePlan} disabled={saving}>
              <Save size={16} strokeWidth={2.3} />
              {saving ? "Menyimpan…" : "Simpan perubahan"}
            </Button>
          ) : undefined
        }
      />

      {/* Status banner */}
      <Card
        className={`mb-5 flex items-start gap-4 border-l-4 ${
          onTrack
            ? "border-l-pos-strong !bg-pos-soft/60 dark:border-l-pos-dark dark:!bg-pos/[0.07]"
            : "border-l-neg-strong !bg-neg-soft/60 dark:border-l-neg-dark dark:!bg-neg/[0.07]"
        }`}
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
          <div className="text-body mt-0.5 text-[13.5px] leading-relaxed">
            {yearsToRetirement} tahun lagi menuju pensiun usia {ep.retirementAge}.
            {!onTrack && ` Tambah tabungan `}
            {!onTrack && <strong className="text-heading">{rpShort(required)}/bulan</strong>}
            {!onTrack && ` untuk on track.`}
          </div>
        </div>
      </Card>

      {/* Progress card */}
      <Card className="mb-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-heading font-serif text-[18px] font-semibold sm:text-[20px]">
              Progres Dana Pensiun
            </h2>
            <p className="text-muted mt-0.5 text-[13px]">Proyeksi saat pensiun vs target</p>
          </div>
          <div className="text-right">
            <div
              className={`font-serif text-[19px] font-semibold tabular-nums sm:text-[24px] ${
                onTrack
                  ? "text-pos-strong dark:text-pos-dark"
                  : "text-neg-strong dark:text-neg-dark"
              }`}
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
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Target Dana", rpShort(target)],
            ["Proyeksi", rpShort(projected)],
            ["Dana Kini", rpShort(totalCurrentSavings)],
            ["Nabung/bln", rpShort(monthlyContribTotal)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-surface-sunken p-3 dark:bg-white/5">
              <div className="text-subtle text-[12px] font-semibold">{label}</div>
              <div className="text-heading mt-0.5 font-serif text-[15px] font-semibold tabular-nums">
                {value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Parameter */}
        <Card>
          <h2 className="text-heading mb-4 font-serif text-[18px] font-semibold">
            Parameter Rencana
          </h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Usia sekarang"
                type="number"
                inputMode="numeric"
                value={ep.currentAge}
                onChange={(e) => handlePlanChange({ currentAge: Number(e.target.value) })}
              />
              <Input
                label="Target usia pensiun"
                type="number"
                inputMode="numeric"
                value={ep.retirementAge}
                onChange={(e) => handlePlanChange({ retirementAge: Number(e.target.value) })}
              />
            </div>
            <CurrencyInput
              label="Kebutuhan bulanan saat ini (Rp)"
              hint="Nilai uang hari ini — akan disesuaikan inflasi"
              value={ep.monthlyNeedToday}
              onChange={(v) => handlePlanChange({ monthlyNeedToday: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Inflasi/tahun (%)"
                type="number"
                inputMode="decimal"
                hint="Rata-rata Indonesia ±5-6%"
                value={ep.inflationRate}
                onChange={(e) => handlePlanChange({ inflationRate: Number(e.target.value) })}
              />
              <Input
                label="Return investasi/tahun (%)"
                type="number"
                inputMode="decimal"
                hint="Reksa dana ~8-12%"
                value={ep.expectedReturn}
                onChange={(e) => handlePlanChange({ expectedReturn: Number(e.target.value) })}
              />
            </div>
            <Input
              label="Masa pensiun (tahun)"
              type="number"
              inputMode="numeric"
              hint={`Estimasi hidup hingga ${ep.retirementAge + ep.lifeExpectancy} tahun`}
              value={ep.lifeExpectancy}
              onChange={(e) => handlePlanChange({ lifeExpectancy: Number(e.target.value) })}
            />

            {/* Ringkasan kalkulasi */}
            <div className="rounded-xl border border-black/[.06] bg-surface-sunken p-3.5 dark:border-white/10 dark:bg-white/5 sm:p-4">
              <div className="text-subtle mb-3 text-[12px] font-bold uppercase tracking-wide">
                Ringkasan kalkulasi
              </div>
              <div className="space-y-2.5 text-[13.5px]">
                {[
                  ["Kebutuhan/bln saat pensiun", rpShort(monthlyAtRetirement)],
                  ["Target total dana", rpShort(target)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-muted">{label}</span>
                    <span className="text-heading font-semibold tabular-nums">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-2 border-t border-black/[.06] pt-2.5 dark:border-white/10">
                  <span className="text-body font-semibold">Perlu nabung/bulan</span>
                  <span
                    className={`font-bold tabular-nums ${required > 0 ? "text-neg-strong dark:text-neg-dark" : "text-pos-strong dark:text-pos-dark"}`}
                  >
                    {required > 0 ? rpShort(required) : "Sudah cukup! 🎉"}
                  </span>
                </div>
              </div>
            </div>

            {isDirty && (
              <Button onClick={savePlan} disabled={saving} className="w-full">
                <Save size={16} />
                {saving ? "Menyimpan…" : "Simpan parameter"}
              </Button>
            )}
          </div>
        </Card>

        {/* Sumber dana */}
        <div className="flex flex-col gap-4">
          {/* Aset terhubung */}
          <Card>
            <h2 className="text-heading mb-1 font-serif text-[18px] font-semibold">
              Aset Terhubung
            </h2>
            <p className="text-muted mb-4 text-[13px]">Dari Emas, Saham, dan Aset Lainnya.</p>
            <ul className="space-y-2.5">
              {[
                ["🪙 Emas", linkedAssets.goldValue],
                ["📈 Saham", linkedAssets.stockValue],
                ["📦 Aset Lainnya", linkedAssets.otherValue],
              ].map(([label, value]) => (
                <li
                  key={String(label)}
                  className="flex items-center justify-between gap-3 text-[13.5px]"
                >
                  <span className="text-body">{label}</span>
                  <span className="text-heading font-semibold tabular-nums">
                    {rpShort(Number(value))}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 border-t border-black/[.06] pt-2.5 text-[14px] dark:border-white/10">
                <span className="text-heading font-semibold">Total terhubung</span>
                <span className="text-heading font-bold tabular-nums">
                  {rpShort(linkedAssets.total)}
                </span>
              </li>
            </ul>
          </Card>

          {/* Dana pensiun manual */}
          <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-heading font-serif text-[18px] font-semibold">
                Sumber Dana Pensiun
              </h2>
              <Button size="sm" onClick={() => setAddingFund(true)}>
                <Plus size={15} strokeWidth={2.5} /> Tambah
              </Button>
            </div>

            {/* Form tambah */}
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
                    onChange={(e) =>
                      setDraft({ ...draft, type: e.target.value as RetirementFund["type"] })
                    }
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
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleAddFund}>Simpan</Button>
                    <Button variant="secondary" onClick={() => setAddingFund(false)}>
                      Batal
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {planFunds.length === 0 && !addingFund ? (
              <div className="py-8 text-center">
                <div className="mb-2 text-[22px] sm:text-[36px]" aria-hidden="true">
                  🏦
                </div>
                <p className="text-muted text-[13.5px] leading-relaxed">
                  Belum ada sumber dana khusus pensiun.
                  <br />
                  Tambahkan DPLK, BPJS, atau tabungan pensiun.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {planFunds.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-3 rounded-xl border border-black/[.05] p-3 dark:border-white/5"
                  >
                    <span className="shrink-0 text-[18px] sm:text-[22px]" aria-hidden="true">
                      {TYPE_EMOJI[f.type as RetirementFund["type"]] ?? "📦"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-heading truncate text-[14px] font-semibold">
                        {f.name}
                      </div>
                      <div className="text-subtle text-[12.5px]">
                        {TYPE_LABELS[f.type as RetirementFund["type"]] ?? f.type}
                        {f.monthlyContribution > 0 && ` · +${rpShort(f.monthlyContribution)}/bln`}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-heading font-serif text-[15px] font-semibold tabular-nums">
                        {rpShort(f.currentValue)}
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteFundId(f.id)}
                      aria-label={`Hapus ${f.name}`}
                      className="grid h-11 w-11 shrink-0 touch-manipulation place-items-center rounded-xl text-ink-faint transition hover:bg-neg-soft hover:text-neg-strong dark:hover:bg-neg/15 dark:hover:text-neg-dark"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
                {planFunds.length > 0 && (
                  <li className="flex items-center justify-between border-t border-black/[.06] pt-2.5 text-[14px] dark:border-white/10">
                    <span className="text-heading font-semibold">Total</span>
                    <span className="text-heading font-bold tabular-nums">
                      {rpShort(manualTotal)}
                    </span>
                  </li>
                )}
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
              <p className="text-body text-[13.5px] leading-relaxed">
                <strong className="text-heading font-semibold">Rule of 25:</strong> Dana pensiun
                ideal adalah 25× pengeluaran tahunan. Dengan kebutuhanmu{" "}
                <strong className="text-heading">{rpShort(monthlyAtRetirement)}/bulan</strong> saat
                pensiun, targetmu <strong className="text-heading">{rpShort(target)}</strong>.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteFundId}
        onClose={() => setDeleteFundId(null)}
        onConfirm={() => deleteFundId && removeFund(deleteFundId)}
        title="Hapus sumber dana?"
        message="Data ini akan dihapus permanen dari rencana pensiunmu."
      />
    </>
  );
}
