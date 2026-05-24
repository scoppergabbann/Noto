"use client";

import { useEffect, useMemo } from "react";
import {
  Wallet,
  Landmark,
  CreditCard,
  HandCoins,
  Gem,
  TrendingUp,
  Briefcase,
  PiggyBank,
  Scale,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { DonutChart } from "@/components/charts/DonutChart";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import {
  useGoalsStore,
  useReceivablesStore,
  useDebtsStore,
  useCardsStore,
  useGoldStore,
  useStocksStore,
  useAssetsStore,
  useRetirementFundsStore,
  useTransactionsStore,
} from "@/lib/stores";
import { currentGoldValue, stockMarketValue } from "@/lib/finance";
import { availableMonths, txInMonth, sumByType, monthLabel } from "@/lib/analytics";
import { rpShort } from "@/lib/format";

const COLORS = {
  cash: "#f59e0b",
  receivable: "#38bdf8",
  stock: "#22c55e",
  gold: "#facc15",
  pension: "#8b5cf6",
  other: "#94a3b8",
  debt: "#ef4444",
  card: "#fb7185",
};

function safeNumber(n: number) {
  return Number.isFinite(n) ? n : 0;
}

function pct(value: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export default function SummaryPage() {
  const goalsStore = useGoalsStore();
  const receivablesStore = useReceivablesStore();
  const debtsStore = useDebtsStore();
  const cardsStore = useCardsStore();
  const goldStore = useGoldStore();
  const stocksStore = useStocksStore();
  const assetsStore = useAssetsStore();
  const retirementFundsStore = useRetirementFundsStore();
  const transactionsStore = useTransactionsStore();

  useEffect(() => {
    goalsStore.fetch();
    receivablesStore.fetch();
    debtsStore.fetch();
    cardsStore.fetch();
    goldStore.fetch();
    stocksStore.fetch();
    assetsStore.fetch();
    retirementFundsStore.fetch();
    transactionsStore.fetch();
  }, [
    goalsStore.fetch,
    receivablesStore.fetch,
    debtsStore.fetch,
    cardsStore.fetch,
    goldStore.fetch,
    stocksStore.fetch,
    assetsStore.fetch,
    retirementFundsStore.fetch,
    transactionsStore.fetch,
  ]);

  const loading =
    goalsStore.loading ||
    receivablesStore.loading ||
    debtsStore.loading ||
    cardsStore.loading ||
    goldStore.loading ||
    stocksStore.loading ||
    assetsStore.loading ||
    retirementFundsStore.loading ||
    transactionsStore.loading;

  const error =
    goalsStore.error ||
    receivablesStore.error ||
    debtsStore.error ||
    cardsStore.error ||
    goldStore.error ||
    stocksStore.error ||
    assetsStore.error ||
    retirementFundsStore.error ||
    transactionsStore.error;

  const retryAll = () => {
    goalsStore.fetch();
    receivablesStore.fetch();
    debtsStore.fetch();
    cardsStore.fetch();
    goldStore.fetch();
    stocksStore.fetch();
    assetsStore.fetch();
    retirementFundsStore.fetch();
    transactionsStore.fetch();
  };

  const summary = useMemo(() => {
    const cashValue = goalsStore.items.reduce((s, g) => s + safeNumber(g.usedAmount), 0);

    const receivableValue = receivablesStore.items.reduce(
      (s, r) => s + Math.max(0, safeNumber(r.total) - safeNumber(r.paid)),
      0
    );

    const debtValue = debtsStore.items.reduce(
      (s, d) => s + Math.max(0, safeNumber(d.total) - safeNumber(d.paid)),
      0
    );

    const creditCardValue = cardsStore.items.reduce(
      (s, c) => s + Math.max(0, safeNumber(c.spent) - safeNumber(c.paid)),
      0
    );

    const goldValue = goldStore.items.reduce(
      (s, g) =>
        s +
        currentGoldValue(
          safeNumber(g.boughtGrams),
          safeNumber(g.soldGrams),
          safeNumber(g.currentPricePerGram)
        ),
      0
    );

    const stockValue = stocksStore.items.reduce(
      (s, h) => s + stockMarketValue(safeNumber(h.lots), safeNumber(h.currentPrice)),
      0
    );

    const otherAssetValue = assetsStore.items.reduce(
      (s, a) => s + safeNumber(a.currentValue),
      0
    );

    const pensionValue = retirementFundsStore.items.reduce(
      (s, f) => s + safeNumber(f.currentValue),
      0
    );

    const totalAssets =
      cashValue +
      receivableValue +
      goldValue +
      stockValue +
      pensionValue +
      otherAssetValue;

    const totalLiabilities = debtValue + creditCardValue;
    const netWorth = totalAssets - totalLiabilities;

    const assetBreakdown = [
      { name: "Tabungan", value: cashValue, color: COLORS.cash },
      { name: "Piutang", value: receivableValue, color: COLORS.receivable },
      { name: "Saham", value: stockValue, color: COLORS.stock },
      { name: "Emas", value: goldValue, color: COLORS.gold },
      { name: "Pensiun", value: pensionValue, color: COLORS.pension },
      { name: "Aset Lainnya", value: otherAssetValue, color: COLORS.other },
    ].filter((x) => x.value > 0);

    const liabilityBreakdown = [
      { name: "Utang & Cicilan", value: debtValue, color: COLORS.debt },
      { name: "Credit Card", value: creditCardValue, color: COLORS.card },
    ].filter((x) => x.value > 0);

    return {
      cashValue,
      receivableValue,
      debtValue,
      creditCardValue,
      goldValue,
      stockValue,
      otherAssetValue,
      pensionValue,
      totalAssets,
      totalLiabilities,
      netWorth,
      assetBreakdown,
      liabilityBreakdown,
    };
  }, [
    goalsStore.items,
    receivablesStore.items,
    debtsStore.items,
    cardsStore.items,
    goldStore.items,
    stocksStore.items,
    assetsStore.items,
    retirementFundsStore.items,
  ]);

  const cashflow = useMemo(() => {
    const months = availableMonths(transactionsStore.items);
    const activeMonth = months[months.length - 1] || "";
    const monthTx = activeMonth ? txInMonth(transactionsStore.items, activeMonth) : [];

    const income = sumByType(monthTx, "income");
    const expense = sumByType(monthTx, "expense");
    const saved = income - expense;
    const savingsRate = income > 0 ? Math.round((saved / income) * 100) : 0;

    return {
      activeMonth,
      income,
      expense,
      saved,
      savingsRate,
    };
  }, [transactionsStore.items]);

  const health = useMemo(() => {
    const { totalAssets, totalLiabilities, netWorth } = summary;
    const liabilityRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;

    if (netWorth <= 0) {
      return {
        tone: "red" as const,
        label: "perlu perhatian",
        title: "Kekayaan bersih masih negatif",
        description:
          "Kewajibanmu masih lebih besar daripada aset. Fokus utama saat ini adalah menekan utang dan membangun aset likuid.",
      };
    }

    if (liabilityRatio <= 0.25) {
      return {
        tone: "green" as const,
        label: "sehat",
        title: "Kondisi finansial terlihat sehat",
        description:
          "Asetmu jauh lebih besar daripada kewajiban. Pertahankan arus kas positif dan lanjutkan membangun aset produktif.",
      };
    }

    if (liabilityRatio <= 0.5) {
      return {
        tone: "amber" as const,
        label: "cukup aman",
        title: "Kondisi finansial cukup aman",
        description:
          "Aset masih lebih besar daripada kewajiban, tapi porsi kewajiban mulai perlu dipantau agar tidak menekan cashflow.",
      };
    }

    return {
      tone: "red" as const,
      label: "waspada",
      title: "Kewajiban cukup besar",
      description:
        "Porsi kewajiban cukup tinggi dibanding aset. Prioritaskan pelunasan utang berbunga dan jaga dana darurat.",
    };
  }, [summary]);

  const assetRows = [
    {
      label: "Tabungan",
      value: summary.cashValue,
      icon: Wallet,
      color: COLORS.cash,
      desc: `${goalsStore.items.length} goal`,
    },
    {
      label: "Piutang",
      value: summary.receivableValue,
      icon: HandCoins,
      color: COLORS.receivable,
      desc: `${receivablesStore.items.length} catatan`,
    },
    {
      label: "Saham",
      value: summary.stockValue,
      icon: TrendingUp,
      color: COLORS.stock,
      desc: `${stocksStore.items.length} holding`,
    },
    {
      label: "Emas",
      value: summary.goldValue,
      icon: Gem,
      color: COLORS.gold,
      desc: `${goldStore.items.length} aset`,
    },
    {
      label: "Pensiun",
      value: summary.pensionValue,
      icon: PiggyBank,
      color: COLORS.pension,
      desc: `${retirementFundsStore.items.length} sumber dana`,
    },
    {
      label: "Aset Lainnya",
      value: summary.otherAssetValue,
      icon: Briefcase,
      color: COLORS.other,
      desc: `${assetsStore.items.length} aset`,
    },
  ];

  const liabilityRows = [
    {
      label: "Utang & Cicilan",
      value: summary.debtValue,
      icon: Landmark,
      color: COLORS.debt,
      desc: `${debtsStore.items.length} catatan`,
    },
    {
      label: "Credit Card",
      value: summary.creditCardValue,
      icon: CreditCard,
      color: COLORS.card,
      desc: `${cardsStore.items.length} kartu`,
    },
  ];

  if (loading) return <LoadingState label="Memuat ringkasan finansial…" />;
  if (error) return <ErrorState message={error} onRetry={retryAll} />;

  return (
    <>
      <PageHeader
        eyebrow="Financial Overview"
        title={
          <>
            Peta besar <em className="italic text-amber-text dark:text-amber">finansialmu</em>.
          </>
        }
      />

      {/* Top summary */}
      <section className="stagger mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Kekayaan Bersih</div>
          <div
            className={`mt-2 font-serif text-[22px] font-semibold tabular-nums sm:text-[28px] ${
              summary.netWorth >= 0
                ? "text-pos-strong dark:text-pos-dark"
                : "text-neg-strong dark:text-neg-dark"
            }`}
          >
            {summary.netWorth >= 0 ? "" : "-"}
            {rpShort(Math.abs(summary.netWorth))}
          </div>
        </Card>

        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Total Aset</div>
          <div className="text-heading mt-2 font-serif text-[22px] font-semibold tabular-nums sm:text-[28px]">
            {rpShort(summary.totalAssets)}
          </div>
        </Card>

        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Total Kewajiban</div>
          <div className="mt-2 font-serif text-[22px] font-semibold tabular-nums text-neg-strong dark:text-neg-dark sm:text-[28px]">
            {rpShort(summary.totalLiabilities)}
          </div>
        </Card>

        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Financial Health</div>
          <div className="text-heading mt-2 font-serif text-[22px] font-semibold sm:text-[28px]">
            {health.label}
          </div>
          <div className="mt-2">
            <Badge tone={health.tone}>{health.label}</Badge>
          </div>
        </Card>
      </section>

      {/* Insight banner */}
      <Card
        className={`mb-5 flex items-start gap-3.5 ${
          health.tone === "green"
            ? "!bg-pos-soft/60 dark:!bg-pos/[0.07]"
            : health.tone === "amber"
              ? "!bg-amber-soft/60 dark:!bg-amber/[0.07]"
              : "!bg-neg-soft/60 dark:!bg-neg/[0.07]"
        }`}
      >
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            health.tone === "green"
              ? "bg-pos/15 text-pos-strong dark:text-pos-dark"
              : health.tone === "amber"
                ? "bg-amber/15 text-amber-text dark:text-amber"
                : "bg-neg/15 text-neg-strong dark:text-neg-dark"
          }`}
        >
          {health.tone === "green" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        </span>
        <div>
          <div className="text-heading text-[14px] font-bold">{health.title}</div>
          <p className="text-body mt-0.5 text-[13.5px] leading-relaxed">{health.description}</p>
        </div>
      </Card>

      {/* Charts */}
      <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
            Komposisi Aset
          </h2>
          <p className="text-muted mb-3 mt-0.5 text-[13.5px] font-medium">
            Total {rpShort(summary.totalAssets)}
          </p>

          {summary.assetBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[260px_1fr]">
              <div className="relative mx-auto h-[210px] w-full max-w-[260px]">
                <DonutChart
                  data={summary.assetBreakdown}
                  formatValue={(v) => rpShort(v)}
                  innerRadius={62}
                />
              </div>

              <ul className="space-y-2.5">
                {summary.assetBreakdown.map((a) => (
                  <li key={a.name} className="flex items-center gap-2.5 text-[13.5px]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} />
                    <span className="text-body font-medium">{a.name}</span>
                    <span className="text-muted ml-auto font-semibold tabular-nums">
                      {rpShort(a.value)} · {pct(a.value, summary.totalAssets)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-subtle py-12 text-center text-[14px]">
              Belum ada aset yang tercatat.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
            Komposisi Kewajiban
          </h2>
          <p className="text-muted mb-3 mt-0.5 text-[13.5px] font-medium">
            Total {rpShort(summary.totalLiabilities)}
          </p>

          {summary.liabilityBreakdown.length > 0 ? (
            <>
              <div className="relative mx-auto h-[180px] w-full max-w-[220px]">
                <DonutChart
                  data={summary.liabilityBreakdown}
                  formatValue={(v) => rpShort(v)}
                  innerRadius={54}
                />
              </div>

              <ul className="mt-4 space-y-2">
                {summary.liabilityBreakdown.map((l) => (
                  <li key={l.name} className="flex items-center gap-2.5 text-[13.5px]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                    <span className="text-body font-medium">{l.name}</span>
                    <span className="text-muted ml-auto font-semibold tabular-nums">
                      {rpShort(l.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-2 text-[32px]">✨</div>
              <p className="text-muted text-[14px]">Belum ada kewajiban tercatat.</p>
            </div>
          )}
        </Card>
      </section>

      {/* Detail cards */}
      <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
              Detail Aset
            </h2>
            <Badge tone="green">{assetRows.filter((a) => a.value > 0).length} kategori</Badge>
          </div>

          <ul className="space-y-2">
            {assetRows.map((row) => {
              const Icon = row.icon;

              return (
                <li
                  key={row.label}
                  className="flex items-center gap-3 rounded-xl border border-black/[.05] p-3 dark:border-white/5"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ background: `${row.color}22`, color: row.color }}
                  >
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="text-heading truncate text-[14px] font-semibold">
                      {row.label}
                    </div>
                    <div className="text-subtle text-[12.5px]">{row.desc}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-heading font-serif text-[15px] font-bold tabular-nums">
                      {rpShort(row.value)}
                    </div>
                    {summary.totalAssets > 0 && (
                      <div className="text-subtle text-[11.5px]">
                        {pct(row.value, summary.totalAssets)}%
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
              Detail Kewajiban
            </h2>
            <Badge tone={summary.totalLiabilities > 0 ? "red" : "green"}>
              {summary.totalLiabilities > 0 ? "ada kewajiban" : "bersih"}
            </Badge>
          </div>

          <ul className="space-y-2">
            {liabilityRows.map((row) => {
              const Icon = row.icon;

              return (
                <li
                  key={row.label}
                  className="flex items-center gap-3 rounded-xl border border-black/[.05] p-3 dark:border-white/5"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ background: `${row.color}22`, color: row.color }}
                  >
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="text-heading truncate text-[14px] font-semibold">
                      {row.label}
                    </div>
                    <div className="text-subtle text-[12.5px]">{row.desc}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-serif text-[15px] font-bold tabular-nums text-neg-strong dark:text-neg-dark">
                      {rpShort(row.value)}
                    </div>
                    {summary.totalLiabilities > 0 && (
                      <div className="text-subtle text-[11.5px]">
                        {pct(row.value, summary.totalLiabilities)}%
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      {/* Cashflow snapshot */}
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
              Snapshot Cashflow
            </h2>
            <p className="text-muted mt-0.5 text-[13.5px]">
              {cashflow.activeMonth ? monthLabel(cashflow.activeMonth) : "Belum ada transaksi"}
            </p>
          </div>
          <Activity className="text-muted" size={20} />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Pemasukan", rpShort(cashflow.income), "text-pos-strong dark:text-pos-dark"],
            ["Pengeluaran", rpShort(cashflow.expense), "text-neg-strong dark:text-neg-dark"],
            [
              "Ditabung",
              `${cashflow.saved >= 0 ? "" : "-"}${rpShort(Math.abs(cashflow.saved))}`,
              cashflow.saved >= 0
                ? "text-pos-strong dark:text-pos-dark"
                : "text-neg-strong dark:text-neg-dark",
            ],
            ["Savings Rate", `${cashflow.savingsRate}%`, "text-heading"],
          ].map(([label, value, cls]) => (
            <div key={label} className="rounded-xl bg-surface-sunken p-3 dark:bg-white/5">
              <div className="text-subtle text-[12px] font-semibold">{label}</div>
              <div className={`mt-1 font-serif text-[17px] font-bold tabular-nums ${cls}`}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}