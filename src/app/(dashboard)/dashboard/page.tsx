"use client";

import Link from "next/link";
import { Plus, Wallet, Landmark, PiggyBank, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { NetWorthChart } from "@/components/charts/NetWorthChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { HealthGauge } from "@/components/charts/HealthGauge";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  useGoalsStore,
  useDebtsStore,
  useGoldStore,
  useAssetsStore,
  useTransactionsStore,
} from "@/lib/stores";
import { TransactionForm, type TxDraft } from "@/components/forms/TransactionForm";
import { progressPct, healthScore, remainingGrams, currentGoldValue } from "@/lib/finance";
import { rpShort } from "@/lib/format";

export default function DashboardPage() {
  const [userName, setUserName] = useState("...");

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const meta = data.user?.user_metadata;
        const name = meta?.full_name ?? meta?.name ?? data.user?.email?.split("@")[0] ?? "kamu";
        setUserName((name as string).split(" ")[0]);
      });
  }, []);

  const goalsLoading = useGoalsStore((s) => s.loading);
  const goals = useGoalsStore((s) => s.items);
  const debts = useDebtsStore((s) => s.items);
  const gold = useGoldStore((s) => s.items);
  const assets = useAssetsStore((s) => s.items);
  const txs = useTransactionsStore((s) => s.items);
  const addTx = useTransactionsStore((s) => s.add);
  const [txOpen, setTxOpen] = useState(false);

  // ---- Aggregations from real store data ----
  const cashTotal = goals.reduce((s, g) => s + g.usedAmount, 0);
  const goldTotal = gold.reduce(
    (s, g) => s + currentGoldValue(g.boughtGrams, g.soldGrams, g.currentPricePerGram),
    0
  );
  const otherTotal = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalAsset = cashTotal + goldTotal + otherTotal;

  const totalDebt = debts.reduce((s, d) => s + (d.total - d.paid), 0);
  const netWorth = totalAsset - totalDebt;
  const health = healthScore(totalAsset, totalDebt);
  const debtRatio = totalAsset > 0 ? Math.round((totalDebt / totalAsset) * 100) : 0;

  const composition = [
    { name: "Tabungan", value: cashTotal, color: "#6366f1" },
    { name: "Emas", value: goldTotal, color: "#0f9d6b" },
    { name: "Aset Lain", value: otherTotal, color: "#f59425" },
  ].filter((c) => c.value > 0);

  const topGoals = [...goals]
    .sort(
      (a, b) =>
        progressPct(b.usedAmount, b.targetAmount) - progressPct(a.usedAmount, a.targetAmount)
    )
    .slice(0, 4);

  if (goalsLoading) return <LoadingState label="Memuat dashboard…" />;

  function getTodayLabel() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
    }).format(new Date());
  }

  const todayLabel = getTodayLabel();

  return (
    <>
      {/* ── Header ── */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
        <div>
          <p className="text-subtle mb-2 text-[12.5px] font-bold uppercase tracking-[.14em]">
              {todayLabel}
          </p>
          <h1 className="text-heading font-serif text-[20px] font-semibold leading-[1.08] tracking-tight sm:text-[28px] sm:text-[36px]">
            Halo {userName},
            <br className="hidden sm:block" /> ini ringkasan{" "}
            <em className="italic text-amber-text dark:text-amber">finansialmu</em>.
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Button className="shadow-glow" onClick={() => setTxOpen(true)}>
            <Plus size={17} strokeWidth={2.5} />
            <span className="hidden sm:inline">Catat transaksi</span>
            <span className="sm:hidden">Catat</span>
          </Button>
        </div>
      </header>

      {/* ── Metrics row ── */}
      <section
        aria-label="Ringkasan kekayaan"
        className="stagger mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-3"
      >
        <MetricCard
          id="nw"
          hero
          label="Kekayaan Bersih"
          value={rpShort(netWorth)}
          icon={Wallet}
          trend="9,1%"
          trendDir="up"
          trendGood
          caption="6 bulan terakhir"
          spark={[78, 84, 92, 98, 103, 108]}
        />
        <MetricCard
          id="as"
          label="Total Aset"
          value={rpShort(totalAsset)}
          icon={PiggyBank}
          trend="6,8%"
          trendDir="up"
          trendGood
          caption="vs bulan lalu"
          spark={[82, 88, 91, 99, 108, 117]}
          sparkColor="#0f9d6b"
        />
        <MetricCard
          id="db"
          label="Total Utang"
          value={rpShort(totalDebt)}
          icon={Landmark}
          trend="7,4%"
          trendDir="down"
          trendGood
          caption="berkurang — bagus!"
          spark={[41, 39, 36, 34, 31, 29]}
          sparkColor="#d83a3a"
        />
      </section>

      {/* ── Net worth chart + composition ── */}
      <section className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.65fr_1fr]">
        <Card>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
                Pertumbuhan Kekayaan
              </h2>
              <p className="text-muted mt-0.5 text-[13.5px] font-medium">
                Aset vs kewajiban · 8 bulan
              </p>
            </div>
            <div className="flex items-center gap-3 text-[12.5px] font-semibold">
              <span className="text-muted flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-pos" />
                Aset
              </span>
              <span className="text-muted flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-neg" />
                Utang
              </span>
            </div>
          </div>
          <NetWorthChart />
        </Card>

        <Card>
          <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
            Komposisi Aset
          </h2>
          <p className="text-muted mb-3 mt-0.5 text-[13.5px] font-medium">Sebaran kekayaanmu</p>
          <div className="relative mx-auto h-[168px] w-full max-w-[210px]">
            <DonutChart data={composition} formatValue={(v) => rpShort(v)} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="text-subtle text-[11px] font-bold uppercase tracking-wide">
                  Total
                </div>
                <div className="text-heading font-serif text-[17px] font-semibold tabular-nums sm:text-[19px]">
                  {rpShort(totalAsset)}
                </div>
              </div>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {composition.map((c) => (
              <li key={c.name} className="flex items-center gap-2.5 text-[13.5px]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                <span className="text-body font-medium">{c.name}</span>
                <span className="text-muted ml-auto font-semibold tabular-nums">
                  {rpShort(c.value)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* ── Health + goals ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.45fr]">
        <Card>
          <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
            Kesehatan Finansial
          </h2>
          <p className="text-muted mb-5 mt-0.5 text-[13.5px] font-medium">
            Rasio aset terhadap utang
          </p>
          <div className="flex items-center gap-5">
            <HealthGauge score={health} />
            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg bg-pos-soft px-2.5 py-1 text-[13px] font-bold text-pos-strong dark:bg-pos/15 dark:text-pos-dark">
                {health >= 70 ? "Kondisi Baik" : health >= 45 ? "Cukup" : "Perlu Perhatian"}
              </div>
              <p className="text-body text-[13.5px] leading-relaxed">
                Rasio utangmu <strong className="text-heading font-bold">{debtRatio}%</strong> dari
                total aset — masih di bawah ambang aman{" "}
                <strong className="text-heading font-bold">35%</strong>.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
              Financial Goals
            </h2>
            <Link
              href="/cash"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13.5px] font-bold text-amber-text transition hover:bg-amber-soft dark:text-amber dark:hover:bg-amber/10"
            >
              Semua <ArrowUpRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
          <ul className="space-y-1">
            {topGoals.map((g) => {
              const p = progressPct(g.usedAmount, g.targetAmount);
              return (
                <li
                  key={g.id}
                  className="flex min-h-[60px] items-center gap-3 rounded-xl px-1 py-2"
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[17px] sm:text-[20px]"
                    style={{ background: `${g.color}1f` }}
                  >
                    {g.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <span className="text-heading truncate text-[14.5px] font-semibold">
                        {g.item}
                      </span>
                      <span className="text-muted shrink-0 text-[13px] font-medium tabular-nums">
                        {rpShort(g.usedAmount)}{" "}
                        <span className="text-subtle">/ {rpShort(g.targetAmount)}</span>
                      </span>
                    </div>
                    <ProgressBar value={p} color={g.color} />
                  </div>
                  <span
                    className="w-11 text-right text-[15px] font-bold tabular-nums"
                    style={{ color: g.color }}
                  >
                    {p}%
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <TransactionForm
        open={txOpen}
        onClose={() => setTxOpen(false)}
        onSubmit={(d: TxDraft) => addTx(d)}
      />
    </>
  );
}
