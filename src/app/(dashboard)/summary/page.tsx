"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Landmark,
  CreditCard,
  HandCoins,
  Gem,
  TrendingUp,
  Briefcase,
  PiggyBank,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
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
import { CashFlowSankey } from "@/components/charts/CashFlowSankey";
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

function FormulaHint({ formula }: { formula: string }) {
  return (
    <span className="group/formula relative inline-flex">
      <Info className="text-subtle" size={15} strokeWidth={2.4} />
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-6 z-50 w-[240px] rounded-xl border border-white/10 bg-ink/95 px-3 py-2 text-left text-[12px] font-semibold leading-relaxed text-white opacity-0 shadow-softlg backdrop-blur transition group-hover/formula:opacity-100 dark:bg-white/95 dark:text-ink"
      >
        <span className="mb-0.5 block text-[11px] uppercase tracking-[.08em] opacity-70">
          Rumus
        </span>
        {formula}
      </span>
    </span>
  );
}

function AuditMetricCard({
  label,
  value,
  formula,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  formula: string;
  icon: LucideIcon;
  tone?: "neutral" | "green" | "red" | "amber" | "purple";
}) {
  const toneClass =
    tone === "green"
      ? "text-pos-strong dark:text-pos-dark"
      : tone === "red"
        ? "text-neg-strong dark:text-neg-dark"
        : tone === "amber"
          ? "text-amber-text dark:text-amber"
          : tone === "purple"
            ? "text-purple-500 dark:text-purple-300"
            : "text-heading";

  return (
    <Card hoverable>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-muted text-[13px] font-semibold">{label}</div>
          <div
            className={`mt-2 font-serif text-[22px] font-semibold tabular-nums sm:text-[28px] ${toneClass}`}
          >
            {value}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FormulaHint formula={formula} />
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-soft text-amber-text dark:bg-amber/15 dark:text-amber">
            <Icon size={17} strokeWidth={2.3} />
          </span>
        </div>
      </div>
    </Card>
  );
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
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const fetchGoals = goalsStore.fetch;
  const fetchReceivables = receivablesStore.fetch;
  const fetchDebts = debtsStore.fetch;
  const fetchCards = cardsStore.fetch;
  const fetchGold = goldStore.fetch;
  const fetchStocks = stocksStore.fetch;
  const fetchAssets = assetsStore.fetch;
  const fetchRetirementFunds = retirementFundsStore.fetch;
  const fetchTransactions = transactionsStore.fetch;

  useEffect(() => {
    fetchGoals();
    fetchReceivables();
    fetchDebts();
    fetchCards();
    fetchGold();
    fetchStocks();
    fetchAssets();
    fetchRetirementFunds();
    fetchTransactions();
  }, [
    fetchGoals,
    fetchReceivables,
    fetchDebts,
    fetchCards,
    fetchGold,
    fetchStocks,
    fetchAssets,
    fetchRetirementFunds,
    fetchTransactions,
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
    fetchGoals();
    fetchReceivables();
    fetchDebts();
    fetchCards();
    fetchGold();
    fetchStocks();
    fetchAssets();
    fetchRetirementFunds();
    fetchTransactions();
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
    const investmentValue = stockValue + goldValue + pensionValue;
    const liquidInvestmentValue = cashValue + investmentValue;
    const debtRatio = totalAssets > 0 ? Math.round((totalLiabilities / totalAssets) * 100) : 0;
    const productiveAssetRatio =
      totalAssets > 0 ? Math.round((investmentValue / totalAssets) * 100) : 0;
    const receivableRatio =
      totalAssets > 0 ? Math.round((receivableValue / totalAssets) * 100) : 0;

    const assetBreakdown = [
      { name: "Cash", value: cashValue, color: COLORS.cash },
      { name: "Investasi", value: investmentValue, color: COLORS.pension },
      { name: "Piutang", value: receivableValue, color: COLORS.receivable },
      { name: "Aset Lainnya", value: otherAssetValue, color: COLORS.other },
    ]
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);

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
      investmentValue,
      liquidInvestmentValue,
      debtRatio,
      productiveAssetRatio,
      receivableRatio,
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
    const activeMonth = selectedMonth ?? months[months.length - 1] ?? "";
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
  }, [selectedMonth, transactionsStore.items]);

  const availableCashflowMonths = useMemo(
    () => availableMonths(transactionsStore.items),
    [transactionsStore.items]
  );

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

  const monthTx = cashflow.activeMonth
    ? txInMonth(transactionsStore.items, cashflow.activeMonth)
    : [];

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
      <section className="stagger mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AuditMetricCard
          label="Kekayaan Bersih"
          value={`${summary.netWorth >= 0 ? "" : "-"}${rpShort(Math.abs(summary.netWorth))}`}
          icon={Wallet}
          tone={summary.netWorth >= 0 ? "green" : "red"}
          formula="Total aset - total kewajiban."
        />

        <AuditMetricCard
          label="Likuid + Investasi"
          value={rpShort(summary.liquidInvestmentValue)}
          icon={PiggyBank}
          tone="green"
          formula="Cash/tabungan + saham + emas + dana pensiun."
        />

        <AuditMetricCard
          label="Total Kewajiban"
          value={rpShort(summary.totalLiabilities)}
          icon={Landmark}
          tone={summary.totalLiabilities > 0 ? "red" : "green"}
          formula="Sisa utang/cicilan + tagihan kartu kredit belum dibayar."
        />

        <AuditMetricCard
          label="Debt Ratio"
          value={`${summary.debtRatio}%`}
          icon={Activity}
          tone={summary.debtRatio <= 35 ? "green" : summary.debtRatio <= 50 ? "amber" : "red"}
          formula="Total kewajiban / total aset x 100%."
        />
      </section>

      <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <AuditMetricCard
          label="Aset Produktif"
          value={`${summary.productiveAssetRatio}%`}
          icon={TrendingUp}
          tone="purple"
          formula="Saham + emas + dana pensiun, dibandingkan total aset."
        />
        <AuditMetricCard
          label="Piutang"
          value={`${rpShort(summary.receivableValue)} (${summary.receivableRatio}%)`}
          icon={HandCoins}
          tone="amber"
          formula="Total piutang yang belum dibayar. Dipisah karena belum tentu likuid."
        />
        <AuditMetricCard
          label="Savings Rate"
          value={`${cashflow.savingsRate}%`}
          icon={Scale}
          tone={cashflow.savingsRate >= 20 ? "green" : cashflow.savingsRate >= 0 ? "amber" : "red"}
          formula="Ditabung / pemasukan bulan terpilih x 100%."
        />
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

      {/* Alur Cashflow */}
      <Card className="mb-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
              Alur Cash Flow
            </h2>
            <p className="text-muted mt-0.5 text-[13.5px]">
              Dari pemasukan, tabungan, sampai pengeluaran per kategori.
            </p>
          </div>
          {availableCashflowMonths.length > 0 && (
            <Select
              aria-label="Pilih bulan cashflow"
              className="min-h-10 w-[150px] py-2 text-[13.5px]"
              value={cashflow.activeMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            >
              {availableCashflowMonths.map((month) => (
                <option key={month} value={month}>
                  {monthLabel(month)}
                </option>
              ))}
            </Select>
          )}
        </div>

        <CashFlowSankey transactions={monthTx} />
      </Card>

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
