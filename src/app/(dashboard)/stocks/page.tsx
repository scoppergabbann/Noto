"use client";

import { useMemo, useState } from "react";
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

// ── Types ────────────────────────────────────────────────────────────────────
type SortKey = "return" | "value" | "loss" | "newest" | "weight";
type ExpandedSection = "best-worst" | null;

// ── Chart tooltip ─────────────────────────────────────────────────────────────
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

// ── Conviction stars ──────────────────────────────────────────────────────────
function ConvictionBadge({ level }: { level: number }) {
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
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-bold ${colors[level] || colors[3]}`}
      aria-label={`Conviction ${level} dari 5`}
    >
      {"★".repeat(level)}
      {"☆".repeat(5 - level)} {level}/5
    </span>
  );
}

export default function StocksPage() {
  const { items, loading, error, fetch, add, update, remove } = useStocksStore();

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

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(h: StockHolding) {
    setEditing(h);
    setFormOpen(true);
  }
  function handleSubmit(d: StockDraft) {
    editing ? update(editing.id, d) : add(d);
  }

  // ── Portfolio calculations ────────────────────────────────────────────────
  const totalMarket = items.reduce((s, h) => s + stockMarketValue(h.lots, h.currentPrice), 0);
  const totalCost = items.reduce((s, h) => s + stockCostBasis(h.lots, h.avgPrice), 0);
  const totalUPL = totalMarket - totalCost;
  const totalDividend = items.reduce((s, h) => s + h.dividendReceived, 0);
  const totalReturn = totalUPL + totalDividend;
  const avgReturn = portfolioWeightedReturn(items);
  const uplPct = totalCost > 0 ? Math.round((totalUPL / totalCost) * 100 * 10) / 10 : 0;
  const portfolioUp = totalReturn >= 0;

  // ── Simulated portfolio chart (modal vs market value per saham kumulatif) ──
  const chartData = useMemo(() => {
    if (items.length === 0) return [];
    // Build cumulative by sorting items by value and stacking
    const sorted = [...items].sort(
      (a, b) => stockCostBasis(a.lots, a.avgPrice) - stockCostBasis(b.lots, b.avgPrice)
    );
    let cumCost = 0,
      cumMarket = 0;
    return sorted.map((h) => {
      cumCost += stockCostBasis(h.lots, h.avgPrice);
      cumMarket += stockMarketValue(h.lots, h.currentPrice);
      return {
        name: h.ticker,
        market: Math.round(cumMarket),
        cost: Math.round(cumCost),
      };
    });
  }, [items]);

  // ── Best/worst performers ─────────────────────────────────────────────────
  const performers = useMemo(() => {
    if (items.length === 0) return null;
    const withMetrics = items.map((h) => ({
      ...h,
      upl: stockUnrealizedPL(h.lots, h.avgPrice, h.currentPrice),
      uplPct: stockUnrealizedPct(h.avgPrice, h.currentPrice),
      market: stockMarketValue(h.lots, h.currentPrice),
      total: stockTotalReturn(h.lots, h.avgPrice, h.currentPrice, h.dividendReceived),
    }));
    const byReturn = [...withMetrics].sort((a, b) => b.uplPct - a.uplPct);
    const byValue = [...withMetrics].sort((a, b) => b.market - a.market);
    const byDiv = [...withMetrics].sort((a, b) => b.dividendReceived - a.dividendReceived);
    return {
      best: byReturn[0],
      worst: byReturn[byReturn.length - 1],
      biggest: byValue[0],
      topDiv: byDiv[0].dividendReceived > 0 ? byDiv[0] : null,
    };
  }, [items]);

  // ── Unique brokers for filter ─────────────────────────────────────────────
  const brokers = useMemo(() => {
    const set = new Set(items.map((h) => h.broker).filter(Boolean));
    return Array.from(set);
  }, [items]);

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...items];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) => h.ticker.toLowerCase().includes(q) || h.name.toLowerCase().includes(q)
      );
    }

    // Filter by broker
    if (filterBroker !== "all") {
      list = list.filter((h) => h.broker === filterBroker);
    }

    // Sort
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
            stockMarketValue(b.lots, b.currentPrice) - stockMarketValue(a.lots, a.currentPrice);
          break;
        case "loss":
          diff =
            stockUnrealizedPL(a.lots, a.avgPrice, a.currentPrice) -
            stockUnrealizedPL(b.lots, b.avgPrice, b.currentPrice);
          break;
        case "weight":
          diff =
            stockMarketValue(b.lots, b.currentPrice) - stockMarketValue(a.lots, a.currentPrice);
          break;
      }
      return sortAsc ? -diff : diff;
    });

    return list;
  }, [items, search, filterBroker, sortKey, sortAsc]);

  if (loading) return <LoadingState label="Memuat portofolio saham…" />;
  if (error) return <ErrorState message={error} onRetry={fetch} />;

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

      {/* ── Empty state ─────────────────────────────────────────────────── */}
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
          {/* ── Portfolio overview ──────────────────────────────────────── */}
          <section aria-label="Ringkasan portofolio" className="stagger mb-5">
            {/* Hero card */}
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
                  <span className="text-[13px] text-white/60">{items.length} emiten</span>
                </div>
              </div>
            </div>

            {/* Stat cards */}
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
                  sub: `${items.filter((h) => h.dividendReceived > 0).length} emiten`,
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

          {/* ── Portfolio chart ─────────────────────────────────────────── */}
          {chartData.length >= 2 && (
            <Card className="mb-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-heading font-serif text-[18px] font-semibold sm:text-[20px]">
                    Komposisi Portofolio
                  </h2>
                  <p className="text-muted mt-0.5 text-[13px]">
                    Nilai pasar vs modal per emiten (kumulatif)
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

          {/* ── Best/Worst insight ──────────────────────────────────────── */}
          {performers && (
            <Card className="mb-5">
              <button
                className="flex w-full touch-manipulation items-center justify-between gap-3 text-left"
                onClick={() =>
                  setExpandedSection(expandedSection === "best-worst" ? null : "best-worst")
                }
                aria-expanded={expandedSection === "best-worst"}
              >
                <div className="flex items-center gap-2.5">
                  <Award size={18} className="text-amber-text dark:text-amber" aria-hidden="true" />
                  <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[19px]">
                    Insight Portofolio
                  </h2>
                </div>
                {expandedSection === "best-worst" ? (
                  <ChevronUp size={18} className="text-muted" />
                ) : (
                  <ChevronDown size={18} className="text-muted" />
                )}
              </button>

              {expandedSection === "best-worst" && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: "🏆 Best Performer",
                      ticker: performers.best.ticker,
                      name: performers.best.name,
                      value: `${performers.best.uplPct >= 0 ? "+" : ""}${performers.best.uplPct}%`,
                      tone: "text-pos-strong dark:text-pos-dark",
                    },
                    {
                      label: "📉 Worst Performer",
                      ticker: performers.worst.ticker,
                      name: performers.worst.name,
                      value: `${performers.worst.uplPct >= 0 ? "+" : ""}${performers.worst.uplPct}%`,
                      tone: "text-neg-strong dark:text-neg-dark",
                    },
                    {
                      label: "💼 Biggest Position",
                      ticker: performers.biggest.ticker,
                      name: performers.biggest.name,
                      value: rpShort(performers.biggest.market),
                      tone: "text-heading",
                    },
                    {
                      label: "💰 Top Dividend",
                      ticker: performers.topDiv?.ticker ?? "—",
                      name: performers.topDiv?.name ?? "Belum ada dividen",
                      value: performers.topDiv
                        ? rpShort(performers.topDiv.dividendReceived)
                        : "Rp0",
                      tone: "text-heading",
                    },
                  ].map(({ label, ticker, name, value, tone }) => (
                    <div key={label} className="rounded-xl bg-surface-sunken p-3.5 dark:bg-white/5">
                      <div className="text-subtle mb-2 text-[11.5px] font-bold">{label}</div>
                      <div className="text-heading text-[14.5px] font-bold">{ticker}</div>
                      <div className="text-muted truncate text-[12px]">{name}</div>
                      <div
                        className={`mt-1.5 font-serif text-[17px] font-semibold tabular-nums ${tone}`}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ── Filters & search ────────────────────────────────────────── */}
          <Card className="mb-5">
            {/* Search + toggle */}
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
                  placeholder="Cari ticker atau nama…"
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
                {/* Sort */}
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

                {/* Broker filter */}
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

          {/* ── Stock cards ─────────────────────────────────────────────── */}
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

                // Target progress
                const targetProgress =
                  h.targetPrice > 0
                    ? Math.min(100, Math.round((h.currentPrice / h.targetPrice) * 100))
                    : null;

                return (
                  <Card key={h.id} hoverable>
                    {/* Header */}
                    <div className="mb-4 flex items-start gap-3">
                      <div
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-[11px] font-black tracking-tight text-indigo-500 sm:h-[52px] sm:w-[52px] sm:text-[12px]"
                        aria-label={`Saham ${h.ticker}`}
                      >
                        {h.ticker.slice(0, 5)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-heading truncate text-[15px] font-bold">
                            {h.ticker}
                          </div>
                          <Badge tone="indigo">{h.exchange}</Badge>
                          {h.broker && (
                            <span className="text-subtle hidden rounded-md bg-surface-sunken px-2 py-0.5 text-[11.5px] font-semibold dark:bg-white/5 sm:inline">
                              {h.broker}
                            </span>
                          )}
                        </div>
                        <div className="text-muted truncate text-[13px]">{h.name}</div>
                      </div>
                      {/* P&L badge */}
                      <div className="shrink-0 text-right">
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
                          aria-label={`${isUp ? "Untung" : "Rugi"} ${rpShort(Math.abs(upl))}`}
                        >
                          {isUp ? "▲" : "▼"} {rpShort(Math.abs(upl))}
                        </div>
                      </div>
                      <RowActions onEdit={() => openEdit(h)} onDelete={() => setDeleteId(h.id)} />
                    </div>

                    {/* Key metrics grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-black/5 pt-4 text-[13px] dark:border-white/5 sm:grid-cols-3">
                      {[
                        [
                          "Lot / Lembar",
                          `${h.lots} lot · ${(h.lots * 100).toLocaleString("id-ID")} lbr`,
                        ],
                        ["Nilai Pasar", rpShort(market)],
                        ["Harga Beli", `Rp${h.avgPrice.toLocaleString("id-ID")}`],
                        ["Harga Kini", `Rp${h.currentPrice.toLocaleString("id-ID")}`],
                        ["Total Return", `${total >= 0 ? "+" : ""}${rpShort(total)}`],
                        ["Bobot Portofolio", `${weight}%`],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="text-subtle text-[11.5px] font-semibold">{label}</div>
                          <div className="text-heading mt-0.5 text-[13.5px] font-semibold">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dividen */}
                    {h.dividendReceived > 0 && (
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-pos-soft/60 px-3.5 py-2.5 text-[13px] dark:bg-pos/10">
                        <span className="text-body font-medium">💰 Dividen diterima</span>
                        <span className="font-bold tabular-nums text-pos-strong dark:text-pos-dark">
                          {rpShort(h.dividendReceived)}
                        </span>
                      </div>
                    )}

                    {/* Target price progress */}
                    {targetProgress !== null && (
                      <div className="mt-3">
                        <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                          <span className="text-muted flex items-center gap-1.5">
                            <Target size={13} aria-hidden="true" /> Target harga
                          </span>
                          <span className="text-heading font-semibold">
                            Rp{h.targetPrice.toLocaleString("id-ID")}
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

                    {/* Conviction */}
                    {h.conviction > 0 && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-muted text-[12.5px]">Conviction</span>
                        <ConvictionBadge level={h.conviction} />
                      </div>
                    )}

                    {/* Expand toggle for journal */}
                    {(h.buyReason || h.exitPlan || h.notes) && (
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
                    )}

                    {/* Journal expanded */}
                    {expanded && (
                      <div className="mt-3 space-y-3 rounded-xl border border-black/[.05] p-4 dark:border-white/5">
                        {h.buyReason && (
                          <div>
                            <div className="text-subtle mb-1 text-[11.5px] font-bold uppercase tracking-wide">
                              Alasan Beli
                            </div>
                            <p className="text-body text-[13.5px] leading-relaxed">{h.buyReason}</p>
                          </div>
                        )}
                        {h.exitPlan && (
                          <div>
                            <div className="text-subtle mb-1 text-[11.5px] font-bold uppercase tracking-wide">
                              Exit Plan
                            </div>
                            <p className="text-body text-[13.5px] leading-relaxed">{h.exitPlan}</p>
                          </div>
                        )}
                        {h.notes && (
                          <div>
                            <div className="text-subtle mb-1 text-[11.5px] font-bold uppercase tracking-wide">
                              Catatan
                            </div>
                            <p className="text-body text-[13.5px] leading-relaxed">{h.notes}</p>
                          </div>
                        )}
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
