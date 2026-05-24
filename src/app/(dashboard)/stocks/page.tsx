"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Search,
  SlidersHorizontal,
  Target,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Calculator,
  RefreshCcw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { StockForm, type StockDraft } from "./StockForm";
import { useStocksStore } from "@/lib/stores";
import {
  stockMarketValue,
  stockCostBasis,
  stockUnrealizedPL,
  stockUnrealizedPct,
  stockTotalReturn,
  portfolioWeightedReturn,
  stockPortfolioWeight,
} from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { StockHolding } from "@/types";

type SortKey = "return" | "value" | "loss" | "weight";
type ExpandedSection = "portfolio-insight" | null;

type MarketQuote = {
  ticker: string;
  symbol: string;
  price: number | null;
  previousClose: number | null;
  changePercent: number | null;
  marketTime: number | null;
  name: string | null;
  currency: string;
  marketState: string | null;
  source: string;
};

type AggregatedStockHolding = StockHolding & {
  recordCount: number;
  sourceIds: string[];
  marketSource: "yahoo" | "manual";
  marketTime: number | null;
  quoteChangePercent: number | null;
};

function round1(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}

function formatPrice(n: number) {
  return `Rp${Math.round(Number(n || 0)).toLocaleString("id-ID")}`;
}

function formatMarketTime(timestamp: number | null) {
  if (!timestamp) return null;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(timestamp * 1000));
}

function getRecoveryNeeded(avgPrice: number, currentPrice: number) {
  if (!avgPrice || !currentPrice || currentPrice <= 0) return null;
  if (currentPrice >= avgPrice) return 0;
  return round1(((avgPrice - currentPrice) / currentPrice) * 100);
}

function getUpsideToTarget(targetPrice: number, currentPrice: number) {
  if (!targetPrice || !currentPrice || currentPrice <= 0) return null;
  return round1(((targetPrice - currentPrice) / currentPrice) * 100);
}

function getPositionStatus(returnPct: number) {
  if (returnPct <= -50) {
    return {
      label: "Deep Loss",
      className: "bg-neg-soft text-neg-strong dark:bg-neg/15 dark:text-neg-dark",
    };
  }

  if (returnPct < -15) {
    return {
      label: "Loss",
      className: "bg-neg-soft text-neg-strong dark:bg-neg/15 dark:text-neg-dark",
    };
  }

  if (returnPct <= 5) {
    return {
      label: "Flat",
      className: "bg-amber-soft text-amber-text dark:bg-amber/15 dark:text-amber",
    };
  }

  if (returnPct <= 30) {
    return {
      label: "Profit",
      className: "bg-pos-soft text-pos-strong dark:bg-pos/15 dark:text-pos-dark",
    };
  }

  return {
    label: "High Profit",
    className: "bg-pos-soft text-pos-strong dark:bg-pos/15 dark:text-pos-dark",
  };
}

function getConcentrationRisk(weight: number) {
  if (weight > 40) {
    return {
      label: "High Concentration",
      tone: "text-neg-strong dark:text-neg-dark",
      note: "Terlalu dominan di satu saham.",
    };
  }

  if (weight >= 25) {
    return {
      label: "Moderate Concentration",
      tone: "text-amber-text dark:text-amber",
      note: "Masih perlu dipantau.",
    };
  }

  return {
    label: "Healthy Distribution",
    tone: "text-pos-strong dark:text-pos-dark",
    note: "Distribusi cukup sehat.",
  };
}

function normalizeTicker(ticker: string) {
  return ticker.trim().toUpperCase().replace(".JK", "");
}

function aggregateStockHoldings(
  items: StockHolding[],
  marketQuotes: Record<string, MarketQuote>
): AggregatedStockHolding[] {
  type Draft = AggregatedStockHolding & {
    _brokerList: string[];
    _weightedConvictionTotal: number;
    _convictionLots: number;
  };

  const map = new Map<string, Draft>();

  for (const item of items) {
    const ticker = normalizeTicker(item.ticker);
    const exchange = item.exchange || "IDX";
    const key = `${ticker}-${exchange}`;

    const quote = marketQuotes[ticker];
    const quotePrice = quote?.price;
    const currentPrice =
      typeof quotePrice === "number" && quotePrice > 0 ? quotePrice : Number(item.currentPrice || 0);
    const marketSource = typeof quotePrice === "number" && quotePrice > 0 ? "yahoo" : "manual";

    const itemLots = Number(item.lots || 0);
    const itemShares = itemLots * 100;
    const itemCost = itemShares * Number(item.avgPrice || 0);

    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        ...item,
        id: item.id,
        ticker,
        exchange,
        lots: itemLots,
        avgPrice: Number(item.avgPrice || 0),
        currentPrice,
        broker: item.broker || "",
        dividendReceived: Number(item.dividendReceived || 0),
        targetPrice: Number(item.targetPrice || 0),
        conviction: Number(item.conviction || 0),
        recordCount: 1,
        sourceIds: [item.id],
        marketSource,
        marketTime: quote?.marketTime ?? null,
        quoteChangePercent:
          typeof quote?.changePercent === "number" ? round1(quote.changePercent) : null,
        _brokerList: item.broker ? [item.broker] : [],
        _weightedConvictionTotal: Number(item.conviction || 0) * itemLots,
        _convictionLots: itemLots,
      });

      continue;
    }

    const existingShares = Number(existing.lots || 0) * 100;
    const existingCost = existingShares * Number(existing.avgPrice || 0);

    const totalShares = existingShares + itemShares;
    const totalLots = totalShares / 100;
    const totalCost = existingCost + itemCost;

    const brokers = new Set([...(existing._brokerList || []), item.broker].filter(Boolean));

    const weightedConvictionTotal =
      existing._weightedConvictionTotal + Number(item.conviction || 0) * itemLots;
    const convictionLots = existing._convictionLots + itemLots;

    map.set(key, {
      ...existing,
      ticker,
      exchange,
      name: existing.name || item.name,
      broker: Array.from(brokers).join(", "),
      lots: totalLots,
      avgPrice: totalShares > 0 ? Math.round(totalCost / totalShares) : 0,
      currentPrice,
      dividendReceived:
        Number(existing.dividendReceived || 0) + Number(item.dividendReceived || 0),
      targetPrice: existing.targetPrice || item.targetPrice || 0,
      buyReason: existing.buyReason || item.buyReason,
      exitPlan: existing.exitPlan || item.exitPlan,
      conviction:
        convictionLots > 0 ? Math.round(weightedConvictionTotal / convictionLots) : existing.conviction,
      notes: existing.notes || item.notes,
      recordCount: existing.recordCount + 1,
      sourceIds: [...existing.sourceIds, item.id],
      marketSource: existing.marketSource === "yahoo" || marketSource === "yahoo" ? "yahoo" : "manual",
      marketTime: quote?.marketTime ?? existing.marketTime ?? null,
      quoteChangePercent:
        typeof quote?.changePercent === "number"
          ? round1(quote.changePercent)
          : existing.quoteChangePercent,
      _brokerList: Array.from(brokers),
      _weightedConvictionTotal: weightedConvictionTotal,
      _convictionLots: convictionLots,
    });
  }

  return Array.from(map.values()).map(
    ({ _brokerList, _weightedConvictionTotal, _convictionLots, ...item }) => item
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-black/[.06] bg-white/95 px-3 py-2.5 shadow-softlg backdrop-blur dark:border-white/10 dark:bg-[#1b1f28]/95">
      <div className="text-heading mb-1.5 text-[12px] font-bold">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[12.5px]">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted">{p.name === "market" ? "Nilai Pasar" : "Modal"}</span>
          <span className="text-heading ml-auto font-semibold tabular-nums">
            {rpShort(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ConvictionBadge({ level }: { level: number }) {
  const safeLevel = Math.min(5, Math.max(1, Number(level || 3)));

  const colors = [
    "",
    "bg-neg-soft text-neg-strong dark:bg-neg/15 dark:text-neg-dark",
    "bg-neg-soft text-neg-strong dark:bg-neg/15 dark:text-neg-dark",
    "bg-amber-soft text-amber-text dark:bg-amber/15 dark:text-amber",
    "bg-pos-soft text-pos-strong dark:bg-pos/15 dark:text-pos-dark",
    "bg-pos-soft text-pos-strong dark:bg-pos/15 dark:text-pos-dark",
  ];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-bold ${colors[safeLevel] || colors[3]}`}
      aria-label={`Conviction ${safeLevel} dari 5`}
    >
      {"★".repeat(safeLevel)}
      {"☆".repeat(5 - safeLevel)} {safeLevel}/5
    </span>
  );
}

function InsightTile({
  label,
  title,
  subtitle,
  value,
  tone = "text-heading",
}: {
  label: string;
  title: string;
  subtitle?: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl bg-surface-sunken p-3.5 dark:bg-white/5">
      <div className="text-subtle mb-2 text-[11.5px] font-bold">{label}</div>
      <div className="text-heading text-[14.5px] font-bold">{title}</div>
      {subtitle && <div className="text-muted truncate text-[12px]">{subtitle}</div>}
      <div className={`mt-1.5 font-serif text-[17px] font-semibold tabular-nums ${tone}`}>
        {value}
      </div>
    </div>
  );
}

function AverageDownSimulator({
  lots,
  avgPrice,
  currentPrice,
}: {
  lots: number;
  avgPrice: number;
  currentPrice: number;
}) {
  const [newLots, setNewLots] = useState("");
  const [newBuyPrice, setNewBuyPrice] = useState("");

  const result = useMemo(() => {
    const oldShares = Number(lots || 0) * 100;
    const addLots = Number(newLots || 0);
    const addShares = addLots * 100;
    const buyPrice = Number(newBuyPrice || 0);

    if (oldShares <= 0 || addShares <= 0 || buyPrice <= 0) return null;

    const oldCost = oldShares * Number(avgPrice || 0);
    const newCost = addShares * buyPrice;
    const totalShares = oldShares + addShares;
    const totalCost = oldCost + newCost;
    const newAvg = totalCost / totalShares;
    const recovery = getRecoveryNeeded(newAvg, Number(currentPrice || 0));

    return {
      newAvg,
      totalCost,
      totalShares,
      recovery,
    };
  }, [lots, avgPrice, currentPrice, newLots, newBuyPrice]);

  return (
    <div className="rounded-xl border border-black/[.06] bg-surface-sunken p-3.5 dark:border-white/10 dark:bg-white/[.04]">
      <div className="mb-3 flex items-center gap-2">
        <Calculator size={15} className="text-amber-text dark:text-amber" />
        <div>
          <div className="text-heading text-[13px] font-bold">Average Down Simulator</div>
          <div className="text-subtle text-[11.5px]">
            Simulasi avg baru kalau tambah posisi.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-subtle text-[11.5px] font-semibold">Tambah lot</span>
          <input
            value={newLots}
            onChange={(e) => setNewLots(e.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder="100"
            className="text-heading min-h-[38px] rounded-lg border border-black/[.08] bg-white px-3 text-[13px] outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-subtle text-[11.5px] font-semibold">Harga beli baru</span>
          <input
            value={newBuyPrice}
            onChange={(e) => setNewBuyPrice(e.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder={String(currentPrice || 0)}
            className="text-heading min-h-[38px] rounded-lg border border-black/[.08] bg-white px-3 text-[13px] outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5"
          />
        </label>
      </div>

      {result && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-[12.5px]">
          <div>
            <div className="text-subtle font-semibold">Avg baru</div>
            <div className="text-heading mt-0.5 font-bold">{formatPrice(result.newAvg)}</div>
          </div>

          <div>
            <div className="text-subtle font-semibold">Modal baru</div>
            <div className="text-heading mt-0.5 font-bold">{rpShort(result.totalCost)}</div>
          </div>

          <div className="col-span-2">
            <div className="text-subtle font-semibold">Recovery ke BEP</div>
            <div className="mt-0.5 font-bold text-amber-text dark:text-amber">
              {result.recovery === null || result.recovery === 0
                ? "Sudah di atas / dekat BEP"
                : `Butuh naik sekitar +${result.recovery}% dari harga kini`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StocksPage() {
  const {
  items,
  loading,
  error,
  fetch: fetchStocks,
  add,
  update,
  remove,
} = useStocksStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StockHolding | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterBroker, setFilterBroker] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

  const [marketQuotes, setMarketQuotes] = useState<Record<string, MarketQuote>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState("");
  const [quotesFetchedAt, setQuotesFetchedAt] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(h: StockHolding) {
    const original = items.find((item) => item.id === h.id) ?? null;
    setEditing(original);
    setFormOpen(true);
  }

  function handleSubmit(d: StockDraft) {
    editing ? update(editing.id, d) : add(d);
  }

  const tickers = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => normalizeTicker(item.ticker)).filter(Boolean))
    );
  }, [items]);

  async function fetchQuotes() {
    if (tickers.length === 0) return;

    try {
      setQuotesLoading(true);
      setQuotesError("");

      const res = await globalThis.fetch(
  `/api/market/quotes?symbols=${tickers.join(",")}`,
  {
    cache: "no-store",
  }
);

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Gagal mengambil harga market.");
      }

      setMarketQuotes(json.quotes || {});
      setQuotesFetchedAt(json.fetchedAt || new Date().toISOString());
    } catch (error) {
      setQuotesError(error instanceof Error ? error.message : "Gagal mengambil harga market.");
    } finally {
      setQuotesLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickers.join(",")]);

  const aggregatedItems = useMemo(() => {
    return aggregateStockHoldings(items, marketQuotes);
  }, [items, marketQuotes]);

  const totalMarket = aggregatedItems.reduce(
    (s, h) => s + stockMarketValue(h.lots, h.currentPrice),
    0
  );
  const totalCost = aggregatedItems.reduce((s, h) => s + stockCostBasis(h.lots, h.avgPrice), 0);
  const totalUPL = totalMarket - totalCost;
  const totalDividend = aggregatedItems.reduce((s, h) => s + h.dividendReceived, 0);
  const totalReturn = totalUPL + totalDividend;
  const avgReturn = portfolioWeightedReturn(aggregatedItems);
  const uplPct = totalCost > 0 ? round1((totalUPL / totalCost) * 100) : 0;
  const portfolioUp = totalReturn >= 0;

  const chartData = useMemo(() => {
    if (aggregatedItems.length === 0) return [];

    const sorted = [...aggregatedItems].sort(
      (a, b) => stockCostBasis(a.lots, a.avgPrice) - stockCostBasis(b.lots, b.avgPrice)
    );

    let cumCost = 0;
    let cumMarket = 0;

    return sorted.map((h) => {
      cumCost += stockCostBasis(h.lots, h.avgPrice);
      cumMarket += stockMarketValue(h.lots, h.currentPrice);

      return {
        name: h.ticker,
        market: Math.round(cumMarket),
        cost: Math.round(cumCost),
      };
    });
  }, [aggregatedItems]);

  const performers = useMemo(() => {
    if (aggregatedItems.length === 0) return null;

    const withMetrics = aggregatedItems.map((h) => {
      const market = stockMarketValue(h.lots, h.currentPrice);
      const cost = stockCostBasis(h.lots, h.avgPrice);
      const upl = stockUnrealizedPL(h.lots, h.avgPrice, h.currentPrice);
      const uplPct = stockUnrealizedPct(h.avgPrice, h.currentPrice);
      const total = stockTotalReturn(h.lots, h.avgPrice, h.currentPrice, h.dividendReceived);
      const weight = stockPortfolioWeight(h.lots, h.currentPrice, totalMarket);
      const recoveryNeeded = getRecoveryNeeded(h.avgPrice, h.currentPrice);

      return {
        ...h,
        market,
        cost,
        upl,
        uplPct,
        total,
        weight,
        recoveryNeeded,
      };
    });

    const byReturn = [...withMetrics].sort((a, b) => b.uplPct - a.uplPct);
    const byValue = [...withMetrics].sort((a, b) => b.market - a.market);
    const byDiv = [...withMetrics].sort((a, b) => b.dividendReceived - a.dividendReceived);
    const byLoss = [...withMetrics].sort((a, b) => a.upl - b.upl);
    const byRecovery = [...withMetrics].sort(
      (a, b) => Number(b.recoveryNeeded || 0) - Number(a.recoveryNeeded || 0)
    );

    const biggest = byValue[0];
    const concentrationRisk = getConcentrationRisk(biggest.weight);

    return {
      best: byReturn[0],
      worst: byReturn[byReturn.length - 1],
      biggest,
      biggestLoss: byLoss[0],
      topDiv: byDiv[0].dividendReceived > 0 ? byDiv[0] : null,
      recovery: byRecovery[0]?.recoveryNeeded ? byRecovery[0] : null,
      concentrationRisk,
    };
  }, [aggregatedItems, totalMarket]);

  const brokers = useMemo(() => {
    const set = new Set<string>();

    aggregatedItems.forEach((h) => {
      h.broker
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean)
        .forEach((b) => set.add(b));
    });

    return Array.from(set);
  }, [aggregatedItems]);

  const displayed = useMemo(() => {
    let list = [...aggregatedItems];

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter(
        (h) =>
          h.ticker.toLowerCase().includes(q) ||
          h.name.toLowerCase().includes(q) ||
          h.broker.toLowerCase().includes(q)
      );
    }

    if (filterBroker !== "all") {
      list = list.filter((h) =>
        h.broker
          .split(",")
          .map((b) => b.trim())
          .includes(filterBroker)
      );
    }

    list.sort((a, b) => {
      let diff = 0;

      switch (sortKey) {
        case "return":
          diff =
            stockUnrealizedPct(b.avgPrice, b.currentPrice) -
            stockUnrealizedPct(a.avgPrice, a.currentPrice);
          break;
        case "value":
          diff =
            stockMarketValue(b.lots, b.currentPrice) -
            stockMarketValue(a.lots, a.currentPrice);
          break;
        case "loss":
          diff =
            stockUnrealizedPL(a.lots, a.avgPrice, a.currentPrice) -
            stockUnrealizedPL(b.lots, b.avgPrice, b.currentPrice);
          break;
        case "weight":
          diff =
            stockMarketValue(b.lots, b.currentPrice) -
            stockMarketValue(a.lots, a.currentPrice);
          break;
      }

      return sortAsc ? -diff : diff;
    });

    return list;
  }, [aggregatedItems, search, filterBroker, sortKey, sortAsc]);

  if (loading) return <LoadingState label="Memuat portofolio saham…" />;
if (error) return <ErrorState message={error} onRetry={fetchStocks} />;
  return (
    <>
      <PageHeader
        eyebrow="Saham & Portofolio"
        title={
          <>
            Pantau <em className="italic text-amber-text dark:text-amber">investasimu</em>.
          </>
        }
        action={
          <Button onClick={openNew}>
            <Plus size={17} strokeWidth={2.5} /> Tambah saham
          </Button>
        }
      />

      {items.length === 0 && (
        <Card className="py-10 text-center sm:py-16">
          <div className="mb-4 text-[48px]" aria-hidden="true">
            📈
          </div>
          <h2 className="text-heading mb-2 font-serif text-[20px] font-semibold">
            Belum ada saham yang dicatat
          </h2>
          <p className="text-muted mx-auto mb-6 max-w-sm text-[14.5px] leading-relaxed">
            Mulai dari satu emiten yang kamu punya, lalu biarkan Noto membantumu membaca perjalanan
            investasimu.
          </p>
          <Button onClick={openNew} className="mx-auto">
            <Plus size={17} strokeWidth={2.5} /> Catat saham pertama
          </Button>
        </Card>
      )}

      {items.length > 0 && (
        <>
          <section aria-label="Ringkasan portofolio" className="stagger mb-5">
            <div
              className="relative mb-4 overflow-hidden rounded-[20px] p-5 text-white shadow-[0_20px_48px_rgba(16,18,24,.18)] sm:p-6"
              style={{
                background: "linear-gradient(135deg, #1a1d27 0%, #232838 55%, #2a2150 100%)",
              }}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
                style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                <p className="mb-1 text-[12.5px] font-bold uppercase tracking-[.14em] text-white/60">
                  Total Nilai Portofolio
                </p>

                <div className="font-serif text-[36px] font-semibold tabular-nums leading-none tracking-tight sm:text-[42px]">
                  {rpShort(totalMarket)}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-bold tabular-nums ${
                      portfolioUp
                        ? "bg-pos-dark/20 text-[#34d399]"
                        : "bg-neg-dark/20 text-[#fb7185]"
                    }`}
                  >
                    {portfolioUp ? (
                      <TrendingUp size={14} aria-hidden="true" />
                    ) : (
                      <TrendingDown size={14} aria-hidden="true" />
                    )}
                    <span>
                      {portfolioUp ? "+" : ""}
                      {uplPct}%
                    </span>
                    <span className="text-white/50">unrealized</span>
                  </span>

                  <span className="text-[13px] text-white/60">
                    Modal <strong className="font-semibold text-white">{rpShort(totalCost)}</strong>
                  </span>

                  <span className="text-[13px] text-white/60">
                    {aggregatedItems.length} emiten gabungan
                  </span>

                  <span className="text-[13px] text-white/60">
                    {quotesLoading
                      ? "Harga memuat…"
                      : quotesError
                        ? "Harga manual fallback"
                        : "Harga Yahoo Finance"}
                  </span>

                  <button
                    type="button"
                    onClick={fetchQuotes}
                    disabled={quotesLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[12.5px] font-semibold text-white/80 transition hover:bg-white/15 disabled:opacity-60"
                  >
                    <RefreshCcw size={13} className={quotesLoading ? "animate-spin" : ""} />
                    Refresh harga
                  </button>
                </div>

                {quotesFetchedAt && (
                  <div className="mt-2 text-[12px] text-white/45">
                    Last quote update:{" "}
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    }).format(new Date(quotesFetchedAt))}
                  </div>
                )}

                {quotesError && (
                  <div className="mt-2 text-[12.5px] text-[#fbbf24]">
                    {quotesError}. Data tetap dihitung memakai harga manual terakhir.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Unrealized P&L",
                  value: `${totalUPL >= 0 ? "+" : ""}${rpShort(totalUPL)}`,
                  cls:
                    totalUPL >= 0
                      ? "text-pos-strong dark:text-pos-dark"
                      : "text-neg-strong dark:text-neg-dark",
                  icon:
                    totalUPL >= 0 ? (
                      <TrendingUp size={15} aria-hidden="true" />
                    ) : (
                      <TrendingDown size={15} aria-hidden="true" />
                    ),
                },
                {
                  label: "Total Return",
                  value: `${totalReturn >= 0 ? "+" : ""}${rpShort(totalReturn)}`,
                  cls:
                    totalReturn >= 0
                      ? "text-pos-strong dark:text-pos-dark"
                      : "text-neg-strong dark:text-neg-dark",
                  sub: `+dividen ${rpShort(totalDividend)}`,
                },
                {
                  label: "Avg. Return",
                  value: `${avgReturn >= 0 ? "+" : ""}${avgReturn}%`,
                  cls:
                    avgReturn >= 0
                      ? "text-pos-strong dark:text-pos-dark"
                      : "text-neg-strong dark:text-neg-dark",
                  sub: "weighted by cost",
                },
                {
                  label: "Dividen Diterima",
                  value: rpShort(totalDividend),
                  cls: "text-heading",
                  sub: `${aggregatedItems.filter((h) => h.dividendReceived > 0).length} emiten`,
                },
              ].map(({ label, value, cls, sub, icon }) => (
                <Card key={label} hoverable>
                  <div className="text-muted text-[12px] font-semibold">{label}</div>
                  <div
                    className={`mt-1.5 flex items-center gap-1.5 font-serif text-[18px] font-semibold tabular-nums sm:text-[20px] ${cls}`}
                  >
                    {icon}
                    {value}
                  </div>
                  {sub && <div className="text-subtle mt-1 text-[11.5px]">{sub}</div>}
                </Card>
              ))}
            </div>
          </section>

          {chartData.length >= 2 && (
            <Card className="mb-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-heading font-serif text-[18px] font-semibold sm:text-[20px]">
                    Komposisi Portofolio
                  </h2>
                  <p className="text-muted mt-0.5 text-[13px]">
                    Nilai pasar vs modal per emiten gabungan
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[12.5px] font-semibold">
                  <span className="text-muted flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-pos" aria-hidden="true" />
                    Nilai Pasar
                  </span>
                  <span className="text-muted flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber" aria-hidden="true" />
                    Modal
                  </span>
                </div>
              </div>

              <div className="h-[200px] w-full sm:h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0f9d6b" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#0f9d6b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59425" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#f59425" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="currentColor"
                      strokeOpacity={0.07}
                      vertical={false}
                      className="text-ink-subtle"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fontWeight: 600 }}
                      stroke="currentColor"
                      className="text-subtle"
                      dy={6}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fontWeight: 600 }}
                      stroke="currentColor"
                      className="text-subtle"
                      width={52}
                      tickFormatter={(v) => rpShort(v)}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ stroke: "#f59425", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="market"
                      name="market"
                      stroke="#0f9d6b"
                      strokeWidth={2.5}
                      fill="url(#marketGrad)"
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      name="cost"
                      stroke="#f59425"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#costGrad)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {performers && (
            <Card className="mb-5">
              <button
                className="flex w-full touch-manipulation items-center justify-between gap-3 text-left"
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "portfolio-insight" ? null : "portfolio-insight"
                  )
                }
                aria-expanded={expandedSection === "portfolio-insight"}
              >
                <div className="flex items-center gap-2.5">
                  <Award size={18} className="text-amber-text dark:text-amber" aria-hidden="true" />
                  <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[19px]">
                    Insight Portofolio
                  </h2>
                </div>

                {expandedSection === "portfolio-insight" ? (
                  <ChevronUp size={18} className="text-muted" />
                ) : (
                  <ChevronDown size={18} className="text-muted" />
                )}
              </button>

              {expandedSection === "portfolio-insight" && (
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
                  <InsightTile
                    label="🏆 Best Performer"
                    title={performers.best.ticker}
                    subtitle={performers.best.name}
                    value={`${performers.best.uplPct >= 0 ? "+" : ""}${performers.best.uplPct}%`}
                    tone="text-pos-strong dark:text-pos-dark"
                  />

                  <InsightTile
                    label="📉 Worst Performer"
                    title={performers.worst.ticker}
                    subtitle={performers.worst.name}
                    value={`${performers.worst.uplPct >= 0 ? "+" : ""}${performers.worst.uplPct}%`}
                    tone="text-neg-strong dark:text-neg-dark"
                  />

                  <InsightTile
                    label="💼 Largest Exposure"
                    title={performers.biggest.ticker}
                    subtitle={`${performers.biggest.weight}% bobot`}
                    value={rpShort(performers.biggest.market)}
                  />

                  <InsightTile
                    label="🔥 Biggest Loss"
                    title={performers.biggestLoss.ticker}
                    subtitle={performers.biggestLoss.name}
                    value={`${performers.biggestLoss.upl < 0 ? "-" : "+"}${rpShort(Math.abs(performers.biggestLoss.upl))}`}
                    tone={
                      performers.biggestLoss.upl < 0
                        ? "text-neg-strong dark:text-neg-dark"
                        : "text-pos-strong dark:text-pos-dark"
                    }
                  />

                  <InsightTile
                    label="💰 Top Dividend"
                    title={performers.topDiv?.ticker ?? "—"}
                    subtitle={performers.topDiv?.name ?? "Belum ada dividen"}
                    value={performers.topDiv ? rpShort(performers.topDiv.dividendReceived) : "Rp0"}
                  />

                  <InsightTile
                    label="⚠️ Portfolio Risk"
                    title={performers.concentrationRisk.label}
                    subtitle={`${performers.biggest.ticker} · ${performers.biggest.weight}%`}
                    value={performers.concentrationRisk.note}
                    tone={performers.concentrationRisk.tone}
                  />

                  {performers.recovery && (
                    <div className="col-span-2 rounded-xl border border-amber/20 bg-amber-soft/40 p-3.5 dark:bg-amber/10 lg:col-span-6">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle
                          size={17}
                          className="mt-0.5 shrink-0 text-amber-text dark:text-amber"
                        />
                        <div>
                          <div className="text-heading text-[13px] font-bold">
                            Recovery Needed terbesar: {performers.recovery.ticker}
                          </div>
                          <p className="text-muted mt-1 text-[12.5px] leading-5">
                            Dengan Avg Buy {formatPrice(performers.recovery.avgPrice)} dan harga
                            kini {formatPrice(performers.recovery.currentPrice)}, saham ini butuh
                            naik sekitar{" "}
                            <strong className="text-amber-text dark:text-amber">
                              +{performers.recovery.recoveryNeeded}%
                            </strong>{" "}
                            untuk kembali ke harga rata-rata.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          <Card className="mb-5">
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="text-subtle absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari ticker, nama, atau broker…"
                  aria-label="Cari saham"
                  className="text-heading min-h-[44px] w-full rounded-xl border border-black/[.07] bg-surface-sunken py-2.5 pl-9 pr-4 text-[14px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5"
                />
              </div>

              <button
                onClick={() => setShowFilters((v) => !v)}
                aria-label="Tampilkan filter"
                aria-expanded={showFilters}
                className={`flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl border px-3 text-[13.5px] font-semibold transition ${
                  showFilters
                    ? "border-amber bg-amber text-white"
                    : "border-black/[.08] bg-white text-ink-dim dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                }`}
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-subtle text-[12px] font-bold uppercase tracking-wide">
                    Urutkan
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ["return", "Return Tertinggi"],
                        ["value", "Nilai Terbesar"],
                        ["loss", "Rugi Terbesar"],
                        ["weight", "Bobot Terbesar"],
                      ] as [SortKey, string][]
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          if (sortKey === key) setSortAsc((v) => !v);
                          else {
                            setSortKey(key);
                            setSortAsc(false);
                          }
                        }}
                        className={`flex min-h-[36px] touch-manipulation items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
                          sortKey === key
                            ? "bg-ink text-white dark:bg-white dark:text-ink"
                            : "text-muted hover:text-heading bg-surface-sunken dark:bg-white/5"
                        }`}
                      >
                        {label}
                        {sortKey === key && (sortAsc ? " ↑" : " ↓")}
                      </button>
                    ))}
                  </div>
                </div>

                {brokers.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-subtle text-[12px] font-bold uppercase tracking-wide">
                      Broker
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["all", ...brokers].map((b) => (
                        <button
                          key={b}
                          onClick={() => setFilterBroker(b)}
                          className={`flex min-h-[36px] touch-manipulation items-center rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
                            filterBroker === b
                              ? "bg-ink text-white dark:bg-white dark:text-ink"
                              : "text-muted hover:text-heading bg-surface-sunken dark:bg-white/5"
                          }`}
                        >
                          {b === "all" ? "Semua" : b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {displayed.length === 0 ? (
            <Card className="py-10 text-center">
              <div className="mb-2 text-[36px]" aria-hidden="true">
                🔍
              </div>
              <p className="text-muted text-[14px]">Tidak ada saham yang cocok dengan pencarian.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {displayed.map((h) => {
                const market = stockMarketValue(h.lots, h.currentPrice);
                const cost = stockCostBasis(h.lots, h.avgPrice);
                const upl = stockUnrealizedPL(h.lots, h.avgPrice, h.currentPrice);
                const uplPct = stockUnrealizedPct(h.avgPrice, h.currentPrice);
                const total = stockTotalReturn(
                  h.lots,
                  h.avgPrice,
                  h.currentPrice,
                  h.dividendReceived
                );
                const weight = stockPortfolioWeight(h.lots, h.currentPrice, totalMarket);
                const isUp = upl >= 0;
                const expanded = expandedCard === h.id;
                const status = getPositionStatus(uplPct);

                const targetPrice = Number(h.targetPrice || 0);
                const upsideToTarget = getUpsideToTarget(targetPrice, h.currentPrice);
                const recoveryNeeded = getRecoveryNeeded(h.avgPrice, h.currentPrice);
                const marketTimeLabel = formatMarketTime(h.marketTime);

                const targetProgress =
                  targetPrice > 0
                    ? Math.min(100, Math.round((h.currentPrice / targetPrice) * 100))
                    : null;

                return (
                  <Card key={`${h.ticker}-${h.exchange}`} hoverable>
                    <div className="mb-4 flex items-start gap-3">
                      <div
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-[11px] font-black tracking-tight text-indigo-500 sm:h-[52px] sm:w-[52px] sm:text-[12px]"
                        aria-label={`Saham ${h.ticker}`}
                      >
                        {h.ticker.slice(0, 5)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-heading truncate text-[15px] font-bold">
                            {h.ticker}
                          </div>

                          <Badge tone="indigo">{h.exchange}</Badge>

                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${status.className}`}
                          >
                            {status.label}
                          </span>

                          {h.recordCount > 1 && (
                            <span className="rounded-md bg-amber-soft px-2 py-0.5 text-[11px] font-bold text-amber-text dark:bg-amber/15 dark:text-amber">
                              {h.recordCount} posisi digabung
                            </span>
                          )}
                        </div>

                        <div className="text-muted truncate text-[13px]">{h.name}</div>

                        {h.broker && (
                          <div className="text-subtle mt-0.5 truncate text-[12px]">
                            Broker: {h.broker}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-subtle text-[11px] font-bold uppercase tracking-wide">
                          {isUp ? "Unrealized Profit" : "Unrealized Loss"}
                        </div>
                        <div
                          className={`font-serif text-[20px] font-semibold tabular-nums ${
                            isUp
                              ? "text-pos-strong dark:text-pos-dark"
                              : "text-neg-strong dark:text-neg-dark"
                          }`}
                        >
                          {isUp ? "+" : ""}
                          {uplPct}%
                        </div>
                        <div
                          className={`text-[12.5px] font-medium ${
                            isUp
                              ? "text-pos-strong dark:text-pos-dark"
                              : "text-neg-strong dark:text-neg-dark"
                          }`}
                        >
                          {isUp ? "▲" : "▼"} {isUp ? "+" : "-"}
                          {rpShort(Math.abs(upl))}
                        </div>
                      </div>

                      <RowActions onEdit={() => openEdit(h)} onDelete={() => setDeleteId(h.id)} />
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-black/5 pt-4 text-[13px] dark:border-white/5 sm:grid-cols-3">
                      {[
                        [
                          "Total Lot / Lembar",
                          `${h.lots.toLocaleString("id-ID")} lot · ${(h.lots * 100).toLocaleString(
                            "id-ID"
                          )} lbr`,
                        ],
                        ["Avg Buy Gabungan", formatPrice(h.avgPrice)],
                        [
                          "Harga Kini",
                          `${formatPrice(h.currentPrice)} · ${
                            h.marketSource === "yahoo" ? "Yahoo" : "Manual"
                          }`,
                        ],
                        ["Total Modal", rpShort(cost)],
                        ["Nilai Pasar", rpShort(market)],
                        ["Bobot Portofolio", `${weight}%`],
                        ["Total Return", `${total >= 0 ? "+" : ""}${rpShort(total)}`],
                        [
                          "Recovery BEP",
                          recoveryNeeded === null
                            ? "—"
                            : recoveryNeeded === 0
                              ? "Sudah BEP"
                              : `+${recoveryNeeded}%`,
                        ],
                        [
                          "Target Upside",
                          upsideToTarget === null
                            ? "Belum ada target"
                            : `${upsideToTarget >= 0 ? "+" : ""}${upsideToTarget}%`,
                        ],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="text-subtle text-[11.5px] font-semibold">{label}</div>
                          <div className="text-heading mt-0.5 text-[13.5px] font-semibold">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
                      <span
                        className={`rounded-lg px-2.5 py-1 font-semibold ${
                          h.marketSource === "yahoo"
                            ? "bg-pos-soft text-pos-strong dark:bg-pos/15 dark:text-pos-dark"
                            : "bg-amber-soft text-amber-text dark:bg-amber/15 dark:text-amber"
                        }`}
                      >
                        Harga: {h.marketSource === "yahoo" ? "Yahoo Finance" : "Manual fallback"}
                      </span>

                      {typeof h.quoteChangePercent === "number" && (
                        <span
                          className={`rounded-lg px-2.5 py-1 font-semibold ${
                            h.quoteChangePercent >= 0
                              ? "bg-pos-soft text-pos-strong dark:bg-pos/15 dark:text-pos-dark"
                              : "bg-neg-soft text-neg-strong dark:bg-neg/15 dark:text-neg-dark"
                          }`}
                        >
                          Daily {h.quoteChangePercent >= 0 ? "+" : ""}
                          {h.quoteChangePercent}%
                        </span>
                      )}

                      {marketTimeLabel && (
                        <span className="text-subtle rounded-lg bg-surface-sunken px-2.5 py-1 font-semibold dark:bg-white/5">
                          Update {marketTimeLabel}
                        </span>
                      )}
                    </div>

                    {recoveryNeeded !== null && recoveryNeeded > 0 && (
                      <div className="mt-3 rounded-xl border border-amber/20 bg-amber-soft/40 px-3.5 py-2.5 text-[12.5px] dark:bg-amber/10">
                        <div className="flex items-start gap-2">
                          <AlertTriangle
                            size={15}
                            className="mt-0.5 shrink-0 text-amber-text dark:text-amber"
                          />
                          <p className="text-muted leading-5">
                            Butuh naik sekitar{" "}
                            <strong className="text-amber-text dark:text-amber">
                              +{recoveryNeeded}%
                            </strong>{" "}
                            dari harga kini untuk balik ke Avg Buy {formatPrice(h.avgPrice)}.
                          </p>
                        </div>
                      </div>
                    )}

                    {h.dividendReceived > 0 && (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-pos-soft/60 px-3.5 py-2.5 text-[13px] dark:bg-pos/10">
                        <span className="text-body font-medium">💰 Dividen diterima</span>
                        <span className="font-bold tabular-nums text-pos-strong dark:text-pos-dark">
                          {rpShort(h.dividendReceived)}
                        </span>
                      </div>
                    )}

                    {targetProgress !== null && (
                      <div className="mt-3">
                        <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                          <span className="text-muted flex items-center gap-1.5">
                            <Target size={13} aria-hidden="true" /> Target harga
                          </span>
                          <span className="text-heading font-semibold">
                            {formatPrice(targetPrice)}
                            <span className="text-subtle ml-1.5">({targetProgress}% tercapai)</span>
                          </span>
                        </div>
                        <ProgressBar
                          value={targetProgress}
                          color={targetProgress >= 100 ? "#0f9d6b" : "#f59425"}
                          height={7}
                          label={`Target harga ${targetProgress}% tercapai`}
                        />
                      </div>
                    )}

                    {h.conviction > 0 && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-muted text-[12.5px]">Conviction</span>
                        <ConvictionBadge level={h.conviction} />
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedCard(expanded ? null : h.id)}
                      aria-expanded={expanded}
                      className="text-muted hover:text-heading mt-3.5 flex w-full touch-manipulation items-center gap-2 rounded-xl border border-black/[.05] px-3.5 py-2.5 text-[13px] font-semibold transition hover:bg-surface-sunken dark:border-white/5 dark:hover:bg-white/5"
                    >
                      <BookOpen size={14} aria-hidden="true" />
                      Investment Journal
                      {expanded ? (
                        <ChevronUp size={14} className="ml-auto" />
                      ) : (
                        <ChevronDown size={14} className="ml-auto" />
                      )}
                    </button>

                    {expanded && (
                      <div className="mt-3 space-y-3 rounded-xl border border-black/[.05] p-4 dark:border-white/5">
                        {h.recordCount > 1 && (
                          <div className="rounded-xl border border-amber/20 bg-amber-soft/40 p-3 text-[12.5px] text-muted dark:bg-amber/10">
                            Data ini adalah hasil gabungan dari {h.recordCount} posisi dengan ticker{" "}
                            <strong className="text-heading">{h.ticker}</strong>. Avg Buy dihitung
                            dari total modal dibagi total lembar.
                          </div>
                        )}

                        {h.buyReason || h.exitPlan || h.notes ? (
                          <>
                            {h.buyReason && (
                              <div>
                                <div className="text-subtle mb-1 text-[11.5px] font-bold uppercase tracking-wide">
                                  Alasan Beli
                                </div>
                                <p className="text-body text-[13.5px] leading-relaxed">
                                  {h.buyReason}
                                </p>
                              </div>
                            )}

                            {h.exitPlan && (
                              <div>
                                <div className="text-subtle mb-1 text-[11.5px] font-bold uppercase tracking-wide">
                                  Exit Plan
                                </div>
                                <p className="text-body text-[13.5px] leading-relaxed">
                                  {h.exitPlan}
                                </p>
                              </div>
                            )}

                            {h.notes && (
                              <div>
                                <div className="text-subtle mb-1 text-[11.5px] font-bold uppercase tracking-wide">
                                  Catatan
                                </div>
                                <p className="text-body text-[13.5px] leading-relaxed">
                                  {h.notes}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="rounded-xl bg-surface-sunken p-3 text-[13px] text-muted dark:bg-white/5">
                            Belum ada catatan investasi. Tambahkan alasan beli, exit plan, atau
                            catatan saat edit saham.
                          </div>
                        )}

                        <AverageDownSimulator
                          lots={h.lots}
                          avgPrice={h.avgPrice}
                          currentPrice={h.currentPrice}
                        />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <StockForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Hapus saham?"
        message="Data saham ini akan dihapus permanen dari portofolio."
      />
    </>
  );
}