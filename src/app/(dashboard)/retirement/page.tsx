"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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

// ---- Constants ----
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

// ---- Helper: save status toast ----
function SaveStatus({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold shadow-softlg transition-all lg:bottom-6 ${
        status === "saving"
          ? "text-muted bg-surface-raised dark:bg-night-raised2"
          : status === "saved"
            ? "bg-pos-strong text-white"
            : "bg-neg text-white"
      }`}
    >
      {status === "saving" && "Menyimpan…"}
      {status === "saved" && "✓ Tersimpan"}
      {status === "error" && "Gagal menyimpan"}
    </div>
  );
}

export default function RetirementPage() {
  // ---- Stores ----
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

  // ---- Local edit state for the plan form ----
  const [localPlan, setLocalPlan] = useState<Omit<RetirementPlan, "id">>(DEFAULT_PLAN);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // ---- Fund form ----
  const [addingFund, setAddingFund] = useState(false);
  const [deleteFundId, setDeleteFundId] = useState<string | null>(null);
  const [fundDraft, setFundDraft] = useState<Omit<RetirementFund, "id">>({
    planId: "",
    name: "",
    type: "savings",
    currentValue: 0,
    monthlyContribution: 0,
    notes: "",
  });

  // ---- Sync store → local form (hanya sekali saat data datang) ----
  const storedPlan = plans[0] ?? null;

  useEffect(() => {
    if (storedPlan && !isDirty) {
      // Ada data dari Supabase → pakai data user
      const { id: _id, ...rest } = storedPlan;
      void _id;
      setLocalPlan(rest);
    }
    // Kalau belum ada plan dan !isDirty, biarkan DEFAULT_PLAN tampil
  }, [storedPlan, isDirty]);

  // ---- Handler perubahan parameter ----
  function handleChange(patch: Partial<Omit<RetirementPlan, "id">>) {
    setLocalPlan((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
  }

  // ---- Save ke Supabase ----
  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    try {
      if (storedPlan) {
        // Update plan yang sudah ada
        await updatePlan(storedPlan.id, localPlan);
      } else {
        // Buat plan baru (pertama kali)
        await addPlan(localPlan);
        await fetchPlans();
      }
      setIsDirty(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [storedPlan, localPlan, updatePlan, addPlan, fetchPlans]);

  // ---- Add fund ----
  async function handleAddFund() {
    if (!fundDraft.name.trim()) return;
    const planId = storedPlan?.id ?? "";
    if (!planId) {
      // Harus save plan dulu sebelum tambah fund
      await handleSave();
      return;
    }
    await addFund({ ...fundDraft, planId });
    await fetchFunds();
    setFundDraft({
      planId: "",
      name: "",
      type: "savings",
      currentValue: 0,
      monthlyContribution: 0,
      notes: "",
    });
    setAddingFund(false);
  }

  // ---- Linked assets (dari store lain) ----
  const linkedAssets = useMemo(() => {
    const goldValue = goldItems.reduce(
      (s, g) => s + currentGoldValue(g.boughtGrams, g.soldGrams, g.currentPricePerGram),
      0
    );
    const stockValue = stockItems.reduce((s, h) => s + stockMarketValue(h.lots, h.currentPrice), 0);
    const otherValue = assetItems.reduce((s, a) => s + a.currentValue, 0);
    return { goldValue, stockValue, otherValue, total: goldValue + stockValue + otherValue };
  }, [goldItems, stockItems, assetItems]);

  // ---- Calculations ----
  const planFunds = funds.filter((f) => !storedPlan || f.planId === storedPlan.id);
  const manualTotal = planFunds.reduce((s, f) => s + f.currentValue, 0);
  const monthlyContribTotal = planFunds.reduce((s, f) => s + f.monthlyContribution, 0);
  const totalCurrentSavings = manualTotal + linkedAssets.total;

  const lp = localPlan; // alias untuk keterbacaan
  const yearsToRetirement = Math.max(0, lp.retirementAge - lp.currentAge);

  const target = useMemo(
    () =>
      targetFund(
        lp.monthlyNeedToday,
        yearsToRetirement,
        lp.inflationRate,
        lp.lifeExpectancy,
        lp.expectedReturn
      ),
    [lp, yearsToRetirement]
  );

  const projected = useMemo(
    () =>
      projectedFund(totalCurrentSavings, monthlyContribTotal, yearsToRetirement, lp.expectedReturn),
    [totalCurrentSavings, monthlyContribTotal, yearsToRetirement, lp.expectedReturn]
  );

  const gap = fundGap(target, projected);
  const progress = retirementProgress(projected, target);
  const required = requiredMonthlySaving(
    target,
    totalCurrentSavings,
    yearsToRetirement,
    lp.expectedReturn
  );
  const onTrack = gap >= 0;
  const shortfall = Math.max(0, -gap);
  const monthlyAtRetirement =
    lp.monthlyNeedToday * Math.pow(1 + lp.inflationRate / 100, yearsToRetirement);

  // ---- Loading / Error states ----
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
            <Button onClick={handleSave} disabled={saveStatus === "saving"}>
              <Save size={16} strokeWidth={2.3} />
              {saveStatus === "saving" ? "Menyimpan…" : "Simpan"}
            </Button>
          ) : undefined
        }
      />

      {/* Info: belum pernah simpan */}
      {!storedPlan && (
        <Card className="mb-5 flex items-start gap-3.5 !bg-amber-soft/60 dark:!bg-amber/[0.07]">
          <TrendingUp size={18} className="mt-0.5 shrink-0 text-amber-text dark:text-amber" />
          <p className="text-body text-[13.5px] leading-relaxed">
            Atur parameter di bawah sesuai kondisimu, lalu tekan{" "}
            <strong className="text-heading font-bold">Simpan</strong> agar data tersimpan ke akun
            dan tidak hilang saat refresh.
          </p>
        </Card>
      )}

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
            className={`text-[14px] font-bold ${
              onTrack ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark"
            }`}
          >
            {onTrack
              ? `On track! Proyeksi surplus ${rpShort(gap)}`
              : `Perlu ${rpShort(shortfall)} lagi untuk mencapai target`}
          </div>
          <p className="text-body mt-0.5 text-[13.5px] leading-relaxed">
            {yearsToRetirement} tahun lagi menuju pensiun usia {lp.retirementAge}.
            {!onTrack && (
              <>
                {" "}
                Tambah tabungan{" "}
                <strong className="text-heading font-semibold">
                  {rpShort(required)}/bulan
                </strong>{" "}
                untuk on track.
              </>
            )}
          </p>
        </div>
      </Card>

      {/* Progress */}
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
              className={`font-serif text-[26px] font-semibold tabular-nums ${
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

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
        {/* ---- Parameter form ---- */}
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-heading font-serif text-[18px] font-semibold">Parameter Rencana</h2>
            {isDirty && (
              <span className="rounded-lg bg-amber/15 px-2 py-1 text-[12px] font-bold text-amber-text dark:text-amber">
                Belum disimpan
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Usia sekarang"
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                value={lp.currentAge || ""}
                onChange={(e) => handleChange({ currentAge: Number(e.target.value) })}
              />
              <Input
                label="Target usia pensiun"
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                value={lp.retirementAge || ""}
                onChange={(e) => handleChange({ retirementAge: Number(e.target.value) })}
              />
            </div>

            <CurrencyInput
              label="Kebutuhan bulanan saat ini (Rp)"
              hint="Nilai uang hari ini — akan disesuaikan inflasi"
              value={lp.monthlyNeedToday}
              onChange={(v) => handleChange({ monthlyNeedToday: v })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Inflasi/tahun (%)"
                type="number"
                inputMode="decimal"
                hint="Rata-rata Indonesia ±5–6%"
                value={lp.inflationRate || ""}
                onChange={(e) => handleChange({ inflationRate: Number(e.target.value) })}
              />
              <Input
                label="Return investasi/tahun (%)"
                type="number"
                inputMode="decimal"
                hint="Reksa dana ~8–12%"
                value={lp.expectedReturn || ""}
                onChange={(e) => handleChange({ expectedReturn: Number(e.target.value) })}
              />
            </div>

            <Input
              label="Masa pensiun (tahun)"
              type="number"
              inputMode="numeric"
              hint={`Estimasi hidup hingga ${lp.retirementAge + lp.lifeExpectancy} tahun`}
              value={lp.lifeExpectancy || ""}
              onChange={(e) => handleChange({ lifeExpectancy: Number(e.target.value) })}
            />

            {/* Ringkasan kalkulasi */}
            <div className="rounded-xl border border-black/[.06] bg-surface-sunken p-3.5 dark:border-white/10 dark:bg-white/5">
              <div className="text-subtle mb-3 text-[12px] font-bold uppercase tracking-wide">
                Ringkasan kalkulasi
              </div>
              <div className="space-y-2.5 text-[13.5px]">
                {[
                  ["Kebutuhan/bln saat pensiun", rpShort(monthlyAtRetirement)],
                  ["Target total dana", rpShort(target)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-muted">{label}</span>
                    <span className="text-heading font-semibold tabular-nums">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 border-t border-black/[.06] pt-2.5 dark:border-white/10">
                  <span className="text-body font-semibold">Perlu nabung/bulan</span>
                  <span
                    className={`font-bold tabular-nums ${
                      required > 0
                        ? "text-neg-strong dark:text-neg-dark"
                        : "text-pos-strong dark:text-pos-dark"
                    }`}
                  >
                    {required > 0 ? rpShort(required) : "Sudah cukup! 🎉"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol simpan */}
            {isDirty && (
              <Button onClick={handleSave} disabled={saveStatus === "saving"} className="w-full">
                <Save size={16} />
                {saveStatus === "saving" ? "Menyimpan…" : "Simpan parameter"}
              </Button>
            )}
          </div>
        </Card>

        {/* ---- Sumber dana ---- */}
        <div className="flex flex-col gap-4">
          {/* Aset terhubung otomatis */}
          <Card>
            <h2 className="text-heading mb-1 font-serif text-[18px] font-semibold">
              Aset Terhubung
            </h2>
            <p className="text-muted mb-4 text-[13px]">
              Dihitung otomatis dari Emas, Saham, dan Aset Lainnya.
            </p>
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
              <Button size="sm" onClick={() => setAddingFund(true)} disabled={addingFund}>
                <Plus size={15} strokeWidth={2.5} /> Tambah
              </Button>
            </div>

            {/* Form tambah */}
            {addingFund && (
              <div className="mb-4 rounded-xl border border-black/[.07] bg-surface-sunken p-4 dark:border-white/10 dark:bg-white/5">
                {!storedPlan && (
                  <p className="mb-3 rounded-lg bg-amber-soft px-3 py-2 text-[13px] font-medium text-amber-text dark:bg-amber/10 dark:text-amber">
                    Simpan parameter dulu sebelum tambah sumber dana.
                  </p>
                )}
                <div className="text-heading mb-3 text-[13px] font-bold">Sumber Dana Baru</div>
                <div className="flex flex-col gap-3">
                  <Input
                    label="Nama"
                    placeholder="mis. DPLK BCA, Reksa Dana ABC"
                    value={fundDraft.name}
                    onChange={(e) => setFundDraft({ ...fundDraft, name: e.target.value })}
                  />
                  <Select
                    label="Jenis"
                    value={fundDraft.type}
                    onChange={(e) =>
                      setFundDraft({ ...fundDraft, type: e.target.value as RetirementFund["type"] })
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
                    value={fundDraft.currentValue}
                    onChange={(v) => setFundDraft({ ...fundDraft, currentValue: v })}
                  />
                  <CurrencyInput
                    label="Kontribusi bulanan (Rp)"
                    hint="0 jika tidak ada iuran rutin"
                    value={fundDraft.monthlyContribution}
                    onChange={(v) => setFundDraft({ ...fundDraft, monthlyContribution: v })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleAddFund} className="w-full">
                      Simpan
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setAddingFund(false)}
                      className="w-full"
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {planFunds.length === 0 && !addingFund ? (
              <div className="py-8 text-center">
                <div className="mb-2 text-[36px]" aria-hidden="true">
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
                    <span className="shrink-0 text-[22px]" aria-hidden="true">
                      {TYPE_EMOJI[f.type as RetirementFund["type"]]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-heading truncate text-[14px] font-semibold">
                        {f.name}
                      </div>
                      <div className="text-subtle text-[12.5px]">
                        {TYPE_LABELS[f.type as RetirementFund["type"]]}
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
                    <span className="text-heading font-semibold">Total dana khusus</span>
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
                <strong className="text-heading font-semibold">
                  {rpShort(monthlyAtRetirement)}/bulan
                </strong>{" "}
                saat pensiun nanti, target danamu adalah{" "}
                <strong className="text-heading font-semibold">{rpShort(target)}</strong>.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteFundId}
        onClose={() => setDeleteFundId(null)}
        onConfirm={async () => {
          if (deleteFundId) {
            await removeFund(deleteFundId);
            await fetchFunds();
          }
        }}
        title="Hapus sumber dana?"
        message="Data ini akan dihapus permanen dari rencana pensiunmu."
      />

      <SaveStatus status={saveStatus} />
    </>
  );
}
