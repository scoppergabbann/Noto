"use client";

import Link from "next/link";
import {
  Plus,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  House,
  ReceiptText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { NetWorthChart, type NetWorthChartPoint } from "@/components/charts/NetWorthChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { HealthGauge } from "@/components/charts/HealthGauge";
import { TransactionForm, type TxDraft } from "@/components/forms/TransactionForm";
import { useTransactionsStore } from "@/lib/stores";
import { progressPct, healthScore, stockMarketValue } from "@/lib/finance";
import { rpShort } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import {
  generateCurrentMonthNetWorthSnapshot,
  generateNetWorthSnapshotsFromCashMovements,
  getNetWorthSnapshots,
} from "@/lib/actions/net-worth-snapshot";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TABLES = {
  goals: "goals",
  debts: "debts",
  goldAssets: "gold_assets",
  otherAssets: "other_assets",
  receivables: "receivables",
  retirementFunds: "retirement_funds",
  creditCards: "credit_cards",
  stocks: "stock_holdings",
  transactions: "transactions",
  cardTransactions: "card_transactions",
  assetTransfers: "asset_transfers",
} as const;

type Goal = {
  id: string;
  item: string;
  emoji: string;
  color: string;
  targetAmount: number;
  usedAmount: number;
};

type Debt = {
  id: string;
  total: number;
  paid: number;
};

type GoldAsset = {
  id: string;
  boughtGrams: number;
  soldGrams: number;
  currentPricePerGram: number;
};

type OtherAsset = {
  id: string;
  currentValue: number;
};

type Receivable = {
  id: string;
  total: number;
  paid: number;
};

type RetirementFund = {
  id: string;
  currentValue: number;
};

type CreditCard = {
  id: string;
  spent: number;
  paid: number;
};

type StockHolding = {
  id: string;
  lots: number;
  currentPrice: number;
};

type DashboardTransaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  date: string;
};

type DashboardData = {
  goals: Goal[];
  debts: Debt[];
  goldAssets: GoldAsset[];
  otherAssets: OtherAsset[];
  receivables: Receivable[];
  retirementFunds: RetirementFund[];
  creditCards: CreditCard[];
  stocks: StockHolding[];
  transactions: DashboardTransaction[];
};

const initialData: DashboardData = {
  goals: [],
  debts: [],
  goldAssets: [],
  otherAssets: [],
  receivables: [],
  retirementFunds: [],
  creditCards: [],
  stocks: [],
  transactions: [],
};

function toNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function mapGoal(row: Record<string, unknown>): Goal {
  return {
    id: String(row.id),
    item: String(row.item ?? "Untitled Goal"),
    emoji: String(row.emoji ?? "🎯"),
    color: String(row.color ?? "#6b6ff0"),
    targetAmount: toNumber(row.target_amount),
    usedAmount: toNumber(row.used_amount),
  };
}

function mapDebt(row: Record<string, unknown>): Debt {
  return {
    id: String(row.id),
    total: toNumber(row.total),
    paid: toNumber(row.paid),
  };
}

function mapGoldAsset(row: Record<string, unknown>): GoldAsset {
  return {
    id: String(row.id),
    boughtGrams: toNumber(row.bought_grams),
    soldGrams: toNumber(row.sold_grams),
    currentPricePerGram: toNumber(row.current_price_per_gram),
  };
}

function mapOtherAsset(row: Record<string, unknown>): OtherAsset {
  return {
    id: String(row.id),
    currentValue: toNumber(row.current_value),
  };
}

function mapReceivable(row: Record<string, unknown>): Receivable {
  return {
    id: String(row.id),
    total: toNumber(row.total),
    paid: toNumber(row.paid),
  };
}

function mapRetirementFund(row: Record<string, unknown>): RetirementFund {
  return {
    id: String(row.id),
    currentValue: toNumber(row.current_value),
  };
}

function mapCreditCard(row: Record<string, unknown>): CreditCard {
  return {
    id: String(row.id),
    spent: toNumber(row.spent),
    paid: toNumber(row.paid),
  };
}

function mapStockHolding(row: Record<string, unknown>): StockHolding {
  return {
    id: String(row.id),
    lots: toNumber(row.lots),
    currentPrice: toNumber(row.current_price),
  };
}

function mapTransaction(row: Record<string, unknown>): DashboardTransaction {
  const rawType = String(row.type ?? "expense");

  return {
    id: String(row.id),
    type: rawType === "income" ? "income" : "expense",
    amount: toNumber(row.amount),
    date: String(row.date ?? ""),
  };
}

function getMonthKey(date?: string) {
  const d = date ? new Date(date) : new Date();
  if (Number.isNaN(d.getTime())) return null;

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthFromKey(key: string) {
  const [year, month] = key.split("-").map(Number);

  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(year, month - 1, 1));
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

async function selectUserRows(table: string, userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase.from(table).select("*").eq("user_id", userId);

  if (error) {
    console.error(`[dashboard] gagal ambil ${table}:`, error.message);
    return [];
  }

  return data ?? [];
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const addTx = useTransactionsStore((s) => s.add);

  const [userName, setUserName] = useState("...");
  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [txOpen, setTxOpen] = useState(false);
  const [netWorthSeries, setNetWorthSeries] = useState<NetWorthChartPoint[]>([]);

  const loadNetWorthSnapshots = useCallback(async () => {
    try {
      await generateNetWorthSnapshotsFromCashMovements();
      await generateCurrentMonthNetWorthSnapshot();

      const snapshots = await getNetWorthSnapshots();

      setNetWorthSeries(snapshots);
    } catch (error) {
      console.error("[dashboard] gagal load net worth snapshots:", error);
    }
  }, []);

  const realtimeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDashboardData = useCallback(
    async (currentUserId?: string) => {
      const activeUserId = currentUserId ?? userId;
      if (!activeUserId) return;

      try {
        const [
          goalsRows,
          debtsRows,
          goldRows,
          otherAssetRows,
          receivableRows,
          retirementFundRows,
          creditCardRows,
          stockRows,
          transactionRows,
        ] = await Promise.all([
          selectUserRows(TABLES.goals, activeUserId),
          selectUserRows(TABLES.debts, activeUserId),
          selectUserRows(TABLES.goldAssets, activeUserId),
          selectUserRows(TABLES.otherAssets, activeUserId),
          selectUserRows(TABLES.receivables, activeUserId),
          selectUserRows(TABLES.retirementFunds, activeUserId),
          selectUserRows(TABLES.creditCards, activeUserId),
          selectUserRows(TABLES.stocks, activeUserId),
          selectUserRows(TABLES.transactions, activeUserId),
        ]);

        setData({
          goals: goalsRows.map((row) => mapGoal(row as Record<string, unknown>)),
          debts: debtsRows.map((row) => mapDebt(row as Record<string, unknown>)),
          goldAssets: goldRows.map((row) => mapGoldAsset(row as Record<string, unknown>)),
          otherAssets: otherAssetRows.map((row) => mapOtherAsset(row as Record<string, unknown>)),
          receivables: receivableRows.map((row) => mapReceivable(row as Record<string, unknown>)),
          retirementFunds: retirementFundRows.map((row) =>
            mapRetirementFund(row as Record<string, unknown>)
          ),
          creditCards: creditCardRows.map((row) => mapCreditCard(row as Record<string, unknown>)),
          stocks: stockRows.map((row) => mapStockHolding(row as Record<string, unknown>)),
          transactions: transactionRows.map((row) =>
            mapTransaction(row as Record<string, unknown>)
          ),
        });
      } catch (error) {
        console.error("[dashboard] gagal load data:", error);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: authData, error } = await supabase.auth.getUser();

      if (error) {
        console.error("[dashboard] gagal ambil user:", error.message);
        setLoading(false);
        return;
      }

      const user = authData.user;

      if (!user) {
        setUserName("kamu");
        setLoading(false);
        return;
      }

      const meta = user.user_metadata;
      const name = meta?.full_name ?? meta?.name ?? user.email?.split("@")[0] ?? "kamu";

      if (!mounted) return;

      setUserName(String(name).split(" ")[0]);
      setUserId(user.id);

      await loadDashboardData(user.id);
      await loadNetWorthSnapshots();
    }

    init();

    return () => {
      mounted = false;
    };
  }, [loadDashboardData, supabase]);

  useEffect(() => {
    if (!userId) return;

    const refreshDashboard = () => {
      if (realtimeTimer.current) {
        clearTimeout(realtimeTimer.current);
      }

      realtimeTimer.current = setTimeout(() => {
        loadDashboardData(userId);
      }, 350);
    };

    const channel = supabase.channel("noto-dashboard-realtime");

    Object.values(TABLES).forEach((table) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `user_id=eq.${userId}`,
        },
        refreshDashboard
      );
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.info("[dashboard] realtime connected");
      }
    });

    return () => {
      if (realtimeTimer.current) {
        clearTimeout(realtimeTimer.current);
      }

      supabase.removeChannel(channel);
    };
  }, [loadDashboardData, supabase, userId]);

  const goals = data.goals;
  const debts = data.debts;
  const goldAssets = data.goldAssets;
  const otherAssets = data.otherAssets;
  const receivables = data.receivables;
  const retirementFunds = data.retirementFunds;
  const creditCards = data.creditCards;
  const transactions = data.transactions;
  const stocks = data.stocks;

  const now = new Date();
  const currentMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getFullYear() === now.getFullYear() &&
      transactionDate.getMonth() === now.getMonth()
    );
  });
  const monthlyIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyExpense = currentMonthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyRemaining = monthlyIncome - monthlyExpense;
  const spendingRate = monthlyIncome > 0 ? Math.round((monthlyExpense / monthlyIncome) * 100) : 0;
  const savingsRate =
    monthlyIncome > 0 ? Math.round((Math.max(monthlyRemaining, 0) / monthlyIncome) * 100) : 0;
  const todayTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getFullYear() === now.getFullYear() &&
      transactionDate.getMonth() === now.getMonth() &&
      transactionDate.getDate() === now.getDate()
    );
  });
  const todayIncome = todayTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const todayExpense = todayTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const cashTotal = goals.reduce((s, g) => s + g.usedAmount, 0);

  const goldTotal = goldAssets.reduce((s, g) => {
    const remainingGrams = Math.max(g.boughtGrams - g.soldGrams, 0);
    return s + remainingGrams * g.currentPricePerGram;
  }, 0);

  const otherTotal = otherAssets.reduce((s, a) => s + a.currentValue, 0);

  const receivableTotal = receivables.reduce((s, r) => {
    const unpaid = Math.max(r.total - r.paid, 0);
    return s + unpaid;
  }, 0);

  const retirementTotal = retirementFunds.reduce((s, r) => s + r.currentValue, 0);

  const stockTotal = stocks.reduce(
    (s, stock) => s + stockMarketValue(stock.lots, stock.currentPrice),
    0
  );

  const debtTotal = debts.reduce((s, d) => {
    const remaining = Math.max(d.total - d.paid, 0);
    return s + remaining;
  }, 0);

  const creditCardTotal = creditCards.reduce((s, c) => {
    const outstanding = Math.max(c.spent - c.paid, 0);
    return s + outstanding;
  }, 0);
  const totalAsset =
    cashTotal + goldTotal + otherTotal + receivableTotal + retirementTotal + stockTotal;
  const totalDebt = debtTotal + creditCardTotal;
  const netWorth = totalAsset - totalDebt;
  const investmentTotal = stockTotal + goldTotal + retirementTotal;
  const liquidInvestmentTotal = cashTotal + investmentTotal;
  const health = healthScore(totalAsset, totalDebt);

  const debtRatio = totalAsset > 0 ? Math.round((totalDebt / totalAsset) * 100) : 0;
  const liquidCoverageRatio =
    totalDebt > 0 ? Math.round((liquidInvestmentTotal / totalDebt) * 100) : 100;

  const healthInsight =
    totalDebt === 0
      ? "Belum ada utang aktif. Fokus berikutnya: tambah aset produktif dan jaga cash tetap cukup."
      : debtRatio <= 35
        ? "Utang masih di area aman. Kamu bisa lanjut memperbesar investasi tanpa mengabaikan cash cadangan."
        : "Utang mulai berat dibanding aset. Prioritaskan pelunasan utang berbunga sebelum menambah risiko investasi.";

  useEffect(() => {
    if (!userId || loading) return;

    loadNetWorthSnapshots();
  }, [userId, loading, totalAsset, totalDebt, loadNetWorthSnapshots]);

  const visibleNetWorthSeries = netWorthSeries.map((point) => ({
    ...point,
    netWorth: point.asset - point.liability,
    month: formatMonthFromKey(point.month),
  }));

  const composition = [
    { name: "Cash", value: cashTotal, color: "#0f9d6b" },
    { name: "Investasi", value: investmentTotal, color: "#a855f7" },
    { name: "Piutang", value: receivableTotal, color: "#38bdf8" },
    { name: "Aset Lain", value: otherTotal, color: "#E59A39" },
  ]
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const topGoals = [...goals]
    .sort(
      (a, b) =>
        progressPct(b.usedAmount, b.targetAmount) - progressPct(a.usedAmount, a.targetAmount)
    )
    .slice(0, 4);

  const todayLabel = getTodayLabel();

  async function handleSubmitTransaction(d: TxDraft) {
    await Promise.resolve(addTx(d));
    await loadDashboardData(userId ?? undefined);
    setTxOpen(false);
  }

  if (loading) return <LoadingState label="Memuat dashboard…" />;

  return (
    <>
      <header className="mb-7 flex items-center justify-between gap-4 sm:mb-9">
        <div>
          <p className="mb-1.5 text-[12px] font-bold uppercase text-[#858C97]">{todayLabel}</p>
          <h1 className="text-[26px] font-extrabold leading-tight text-[#18202B] dark:text-white sm:text-[36px]">
            Halo, {userName}
          </h1>
          <p className="mt-1 text-[13px] font-medium text-[#858C97] sm:text-[15px]">
            Ini ringkasan finansialmu hari ini.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button
            className="h-12 rounded-2xl bg-[#081F4D] px-4 shadow-[0_8px_22px_rgba(8,31,77,.18)] hover:bg-[#12396D] sm:px-5"
            onClick={() => setTxOpen(true)}
          >
            <Plus size={19} strokeWidth={2.5} />
            <span className="hidden sm:inline">Catat transaksi</span>
            <span className="sr-only sm:hidden">Catat transaksi</span>
          </Button>
        </div>
      </header>

      <section
        aria-label="Ringkasan bulan ini"
        className="stagger mb-5 grid grid-cols-3 gap-2.5 sm:gap-4 lg:grid-cols-5"
      >
        <MetricCard
          id="monthly-balance"
          hero
          className="col-span-3 lg:col-span-2"
          label="Sisa Uang Bulan Ini"
          value={rpShort(monthlyRemaining)}
          icon={Wallet}
          trend={monthlyRemaining >= 0 ? "Tersisa" : "Defisit"}
          trendDir={monthlyRemaining >= 0 ? "up" : "down"}
          trendGood={monthlyRemaining >= 0}
          caption="pemasukan - pengeluaran"
          formula="Total pemasukan dikurangi total pengeluaran pada bulan berjalan."
        />

        <MetricCard
          id="monthly-income"
          label="Pemasukan"
          value={rpShort(monthlyIncome)}
          icon={ArrowDownLeft}
          tone="blue"
          trend={`${currentMonthTransactions.filter((transaction) => transaction.type === "income").length} transaksi`}
          trendDir="up"
          trendGood
          progress={100}
          formula="Total transaksi pemasukan pada bulan berjalan."
        />

        <MetricCard
          id="monthly-expense"
          label="Pengeluaran"
          value={rpShort(monthlyExpense)}
          icon={ArrowUpRight}
          tone="cream"
          trend={`${spendingRate}% pemasukan`}
          trendDir="up"
          trendGood={spendingRate <= 70}
          progress={spendingRate}
          formula="Total transaksi pengeluaran pada bulan berjalan."
        />

        <MetricCard
          id="monthly-saving"
          label="Tabungan"
          value={rpShort(cashTotal)}
          icon={PiggyBank}
          tone="gray"
          trend={`${savingsRate}% tersisa`}
          trendDir={savingsRate > 0 ? "up" : "down"}
          trendGood={savingsRate > 0}
          progress={savingsRate}
          formula="Total saldo pada financial goals. Persentase menunjukkan sisa pemasukan bulan berjalan."
        />
      </section>

      <section aria-label="Kondisi hari ini" className="mb-5">
        <Card className="rounded-[28px] border-[#E8EAEE] bg-white p-5 shadow-[0_8px_30px_rgba(16,24,40,.06)] sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EEF4FF] text-[#275E9D]">
                <House size={21} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase text-[#858C97]">Kondisi hari ini</p>
                <h2 className="truncate text-[17px] font-bold text-[#18202B] dark:text-white sm:text-[20px]">
                  Aktivitas keuanganmu
                </h2>
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#081F4D] px-3 py-2 text-[12px] font-bold text-white sm:text-[13px]">
              <ReceiptText size={15} aria-hidden="true" />
              {todayTransactions.length} transaksi
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.35fr] lg:items-end">
            <div>
              <div className="text-[30px] font-extrabold tabular-nums text-[#081F4D] dark:text-white sm:text-[38px]">
                {rpShort(todayExpense)}
              </div>
              <p className="mt-1 text-[14px] font-bold text-[#E59A39]">keluar hari ini</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] border border-[#F5E4C9] bg-[#FFF6E9] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[10.5px] font-bold uppercase text-[#7B684D] dark:text-slate-400">
                  Pemasukan
                </p>
                <p className="mt-2 text-[17px] font-extrabold tabular-nums text-[#18202B] dark:text-white sm:text-[20px]">
                  {rpShort(todayIncome)}
                </p>
              </div>
              <div className="rounded-[18px] border border-[#DDE8FA] bg-[#EEF4FF] p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[10.5px] font-bold uppercase text-[#5275A4] dark:text-slate-400">
                  Sisa bulan
                </p>
                <p className="mt-2 text-[17px] font-extrabold tabular-nums text-[#081F4D] dark:text-white sm:text-[20px]">
                  {rpShort(monthlyRemaining)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3 text-[12px] font-semibold">
              <span className="text-[#858C97]">Penggunaan pemasukan bulan ini</span>
              <span className="text-[#18202B] dark:text-white">{spendingRate}%</span>
            </div>
            <ProgressBar value={spendingRate} color="#E59A39" height={7} />
          </div>
        </Card>
      </section>

      <section className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.65fr_1fr]">
        <Card className="rounded-[26px] border-[#E8EAEE] bg-white shadow-[0_8px_30px_rgba(16,24,40,.06)]">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
                Pertumbuhan Kekayaan
              </h2>
              <p className="text-muted mt-0.5 text-[13.5px] font-medium">
                Kekayaan bersih {rpShort(netWorth)} · {visibleNetWorthSeries.length || 1} bulan
                tercatat
              </p>
            </div>

            <div className="flex items-center gap-3 text-[12.5px] font-semibold">
              <span className="text-muted flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                Bersih
              </span>
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

          <NetWorthChart data={visibleNetWorthSeries} />
        </Card>

        <Card className="rounded-[26px] border-[#E8EAEE] bg-white shadow-[0_8px_30px_rgba(16,24,40,.06)]">
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

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.45fr]">
        <Card className="rounded-[26px] border-[#E8EAEE] bg-white shadow-[0_8px_30px_rgba(16,24,40,.06)]">
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
                total aset.
                {debtRatio <= 35 ? (
                  <>
                    {" "}
                    Masih di bawah ambang aman{" "}
                    <strong className="text-heading font-bold">35%</strong>.
                  </>
                ) : (
                  <>
                    {" "}
                    Sudah melewati ambang aman{" "}
                    <strong className="text-heading font-bold">35%</strong>.
                  </>
                )}
                {totalDebt > 0 && (
                  <>
                    {" "}
                    Likuid + investasimu setara{" "}
                    <strong className="text-heading font-bold">{liquidCoverageRatio}%</strong> dari
                    total utang.
                  </>
                )}{" "}
                {healthInsight}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-[26px] border-[#E8EAEE] bg-white shadow-[0_8px_30px_rgba(16,24,40,.06)]">
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

            {topGoals.length === 0 && (
              <li className="border-border rounded-xl border border-dashed p-4 text-center">
                <p className="text-heading text-[14px] font-semibold">Belum ada financial goals</p>
                <p className="text-muted mt-1 text-[13px]">
                  Tambahkan target cash agar muncul di dashboard.
                </p>
              </li>
            )}
          </ul>
        </Card>
      </section>

      <TransactionForm
        open={txOpen}
        onClose={() => setTxOpen(false)}
        onSubmit={handleSubmitTransaction}
      />
    </>
  );
}
