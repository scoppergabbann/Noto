"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Search,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Pencil,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { TransactionForm, type TxDraft } from "@/components/forms/TransactionForm";
import { DonutChart } from "@/components/charts/DonutChart";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { useTransactionsStore } from "@/lib/stores";
import { expenseCategories, incomeCategories } from "@/data/mock";
import {
  availableMonths,
  monthLabel,
  txInMonth,
  sumByType,
  byCategory,
  cashflowSeries,
  monthInsight,
} from "@/lib/analytics";
import { rpShort } from "@/lib/format";
import type { Transaction } from "@/types";

const allCats = [...expenseCategories, ...incomeCategories];

const catEmoji = (name: string) => allCats.find((c) => c.name === name)?.emoji ?? "💸";

const catColor = (name: string) => allCats.find((c) => c.name === name)?.color ?? "#64748b";

type CategoryChange = {
  category: string;
  emoji: string;
  color: string;
  current: number;
  previous: number;
  diff: number;
  pct: number | null;
  status: "warning" | "positive" | "new" | "stable";
  message: string;
};

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsed);
}

function buildCategoryTotalMap(transactions: Transaction[], type: Transaction["type"]) {
  const map = new Map<string, number>();

  transactions
    .filter((t) => t.type === type)
    .forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    });

  return map;
}

function getPreviousMonth(months: string[], activeMonth: string) {
  const index = months.indexOf(activeMonth);
  if (index <= 0) return "";
  return months[index - 1];
}

function compareExpenseCategories({
  currentTx,
  previousTx,
  minDiff = 100_000,
  minPct = 20,
}: {
  currentTx: Transaction[];
  previousTx: Transaction[];
  minDiff?: number;
  minPct?: number;
}): CategoryChange[] {
  const currentMap = buildCategoryTotalMap(currentTx, "expense");
  const previousMap = buildCategoryTotalMap(previousTx, "expense");

  const categories = Array.from(new Set([...currentMap.keys(), ...previousMap.keys()]));

  return categories
    .map((category) => {
      const current = currentMap.get(category) ?? 0;
      const previous = previousMap.get(category) ?? 0;
      const diff = current - previous;
      const pct = previous > 0 ? Math.round((diff / previous) * 100) : null;

      let status: CategoryChange["status"] = "stable";
      let message = "Relatif stabil dibanding bulan sebelumnya.";

      if (previous === 0 && current > 0) {
        status = "new";
        message = `Kategori ini baru muncul bulan ini sebesar ${rpShort(current)}.`;
      } else if (pct !== null && diff >= minDiff && pct >= minPct) {
        status = "warning";
        message = `Naik ${rpShort(diff)} atau ${pct}% dibanding bulan lalu. Coba cek apakah ini wajar.`;
      } else if (pct !== null && diff <= -minDiff && pct <= -minPct) {
        status = "positive";
        message = `Turun ${rpShort(Math.abs(diff))} atau ${Math.abs(pct)}% dibanding bulan lalu. Bagus, lebih terkendali.`;
      }

      return {
        category,
        emoji: catEmoji(category),
        color: catColor(category),
        current,
        previous,
        diff,
        pct,
        status,
        message,
      };
    })
    .filter((item) => item.current > 0 || item.previous > 0)
    .sort((a, b) => {
      const priority = { warning: 0, new: 1, positive: 2, stable: 3 };
      const pa = priority[a.status];
      const pb = priority[b.status];

      if (pa !== pb) return pa - pb;
      return Math.abs(b.diff) - Math.abs(a.diff);
    });
}

function statusTone(status: CategoryChange["status"]) {
  if (status === "warning") return "red" as const;
  if (status === "positive") return "green" as const;
  if (status === "new") return "amber" as const;
  return "indigo" as const;
}

function statusIcon(status: CategoryChange["status"]) {
  if (status === "warning") return <AlertTriangle size={13} />;
  if (status === "positive") return <CheckCircle2 size={13} />;
  if (status === "new") return <Sparkles size={13} />;
  return <Lightbulb size={13} />;
}

function TransactionItem({
  tx,
  onEdit,
  onDelete,
}: {
  tx: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const inc = tx.type === "income";
  const emoji = catEmoji(tx.category);
  const color = catColor(tx.category);

  return (
    <li
      className={[
        "rounded-2xl border border-black/[.06] bg-surface-sunken/70 p-3.5",
        "transition hover:bg-white/80 dark:border-white/[.06] dark:bg-white/[.035] dark:hover:bg-white/[.055]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[21px]"
          style={{
            background: inc ? "rgba(15,157,107,.14)" : `${color}26`,
          }}
          aria-hidden="true"
        >
          {emoji}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-heading truncate text-[15px] font-bold leading-5">
                {tx.category}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge tone={inc ? "green" : "red"}>
                  {inc ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {inc ? "masuk" : "keluar"}
                </Badge>

                <span className="text-subtle inline-flex items-center gap-1 text-[12px] font-medium">
                  <CalendarDays size={12} />
                  {formatDate(tx.date)}
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div
                className={[
                  "font-serif text-[16.5px] font-bold leading-5 tabular-nums sm:text-[18px]",
                  inc
                    ? "text-pos-strong dark:text-pos-dark"
                    : "text-neg-strong dark:text-neg-dark",
                ].join(" ")}
              >
                {inc ? "+" : "−"}
                {rpShort(tx.amount)}
              </div>
            </div>
          </div>

          <div className="mt-2 min-w-0">
            <p className="text-muted line-clamp-2 text-[13px] leading-5">
              {tx.note?.trim() ? tx.note : "Tidak ada catatan."}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-black/[.05] pt-2.5 dark:border-white/[.05]">
            <button
              type="button"
              onClick={() => onEdit(tx)}
              className={[
                "inline-flex min-h-[34px] items-center gap-1.5 rounded-xl px-2.5 text-[12px] font-bold",
                "text-muted transition hover:bg-white hover:text-heading",
                "dark:hover:bg-white/10",
              ].join(" ")}
            >
              <Pencil size={14} />
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete(tx.id)}
              className={[
                "inline-flex min-h-[36px] items-center gap-1.5 rounded-xl px-3 text-[12.5px] font-bold",
                "text-neg-strong transition hover:bg-neg-soft",
                "dark:text-neg-dark dark:hover:bg-neg/15",
              ].join(" ")}
            >
              <Trash2 size={14} />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function TransactionsPage() {
  const { items, loading, error, fetch, add, update, remove } = useTransactionsStore();

  const [month, setMonth] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const months = useMemo(() => availableMonths(items), [items]);
  const activeMonth = month || months[months.length - 1] || "";
  const previousMonth = useMemo(() => getPreviousMonth(months, activeMonth), [months, activeMonth]);

  const monthTx = useMemo(
    () => (activeMonth ? txInMonth(items, activeMonth) : items),
    [items, activeMonth]
  );

  const previousMonthTx = useMemo(
    () => (previousMonth ? txInMonth(items, previousMonth) : []),
    [items, previousMonth]
  );

  const insight = useMemo(() => monthInsight(items, activeMonth), [items, activeMonth]);

  const expenseCats = useMemo(
    () =>
      byCategory(monthTx, "expense").map((c) => ({
        ...c,
        color: catColor(c.name),
      })),
    [monthTx]
  );

  const flow = useMemo(() => cashflowSeries(items, 6), [items]);

  const categoryChanges = useMemo(
    () =>
      compareExpenseCategories({
        currentTx: monthTx,
        previousTx: previousMonthTx,
      }),
    [monthTx, previousMonthTx]
  );

  const importantChanges = useMemo(
    () => categoryChanges.filter((c) => c.status !== "stable").slice(0, 5),
    [categoryChanges]
  );

  const filtered = useMemo(() => {
    let list = activeMonth ? txInMonth(items, activeMonth) : items;

    if (typeFilter !== "all") {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter(
        (t) => t.category.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [items, activeMonth, typeFilter, search]);

  const totalIn = sumByType(monthTx, "income");
  const totalOut = sumByType(monthTx, "expense");
  const net = totalIn - totalOut;

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(t: Transaction) {
    setEditing(t);
    setFormOpen(true);
  }

  function handleSubmit(d: TxDraft) {
    editing ? update(editing.id, d) : add(d);
  }

  if (loading) return <LoadingState label="Memuat transaksi…" />;
  if (error) return <ErrorState message={error} onRetry={fetch} />;

  return (
    <>
      <PageHeader
        eyebrow={`Transaksi · ${activeMonth ? monthLabel(activeMonth) : "Semua"}`}
        title={
          <>
            Semua keluar <em className="italic text-amber-text dark:text-amber">masuk</em>{" "}
            uangmu.
          </>
        }
        action={
          <Button onClick={openNew}>
            <Plus size={17} strokeWidth={2.5} /> Catat transaksi
          </Button>
        }
      />

      {months.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition ${
                m === activeMonth
                  ? "bg-gradient-to-br from-amber to-amber-deep text-white shadow-glow"
                  : "card text-muted hover:text-heading"
              }`}
            >
              {monthLabel(m)}
            </button>
          ))}
        </div>
      )}

      <section className="stagger mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Pemasukan</div>
          <div className="mt-2 font-serif text-[22px] font-semibold tabular-nums text-pos-strong dark:text-pos-dark sm:text-[28px]">
            {rpShort(totalIn)}
          </div>
        </Card>

        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Pengeluaran</div>
          <div className="mt-2 font-serif text-[22px] font-semibold tabular-nums text-neg-strong dark:text-neg-dark sm:text-[28px]">
            {rpShort(totalOut)}
          </div>
          {insight.expenseChange !== null && (
            <div className="mt-2">
              <Badge tone={insight.expenseChange <= 0 ? "green" : "red"}>
                {insight.expenseChange <= 0 ? (
                  <TrendingDown size={12} />
                ) : (
                  <TrendingUp size={12} />
                )}
                {Math.abs(insight.expenseChange)}% vs lalu
              </Badge>
            </div>
          )}
        </Card>

        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Selisih</div>
          <div
            className={`mt-2 font-serif text-[22px] font-semibold tabular-nums sm:text-[28px] ${
              net >= 0
                ? "text-pos-strong dark:text-pos-dark"
                : "text-neg-strong dark:text-neg-dark"
            }`}
          >
            {net >= 0 ? "+" : ""}
            {rpShort(net)}
          </div>
        </Card>

        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Savings Rate</div>
          <div className="text-heading mt-2 font-serif text-[22px] font-semibold tabular-nums sm:text-[28px]">
            {insight.savingsRate}%
          </div>
          <div className="mt-2">
            <Badge
              tone={
                insight.savingsRate >= 20 ? "green" : insight.savingsRate >= 10 ? "amber" : "red"
              }
            >
              {insight.savingsRate >= 20
                ? "sehat"
                : insight.savingsRate >= 10
                  ? "cukup"
                  : "tipis"}
            </Badge>
          </div>
        </Card>
      </section>

      {insight.topCategory && (
        <Card className="mb-5 flex items-start gap-3.5 !bg-amber-soft/60 dark:!bg-amber/[0.07]">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber-text dark:text-amber">
            <Lightbulb size={20} />
          </span>

          <div className="text-body text-[13.5px] leading-relaxed">
            Bulan ini pengeluaran terbesarmu di{" "}
            <strong className="text-heading font-bold">{insight.topCategory.name}</strong> sebesar{" "}
            <strong className="text-heading font-bold">
              {rpShort(insight.topCategory.value)}
            </strong>
            .

            {insight.expenseChange !== null && insight.expenseChange > 10 && (
              <>
                {" "}
                Total belanja naik{" "}
                <strong className="font-bold text-neg-strong dark:text-neg-dark">
                  {insight.expenseChange}%
                </strong>{" "}
                dari bulan lalu.
              </>
            )}

            {insight.savingsRate >= 20 && (
              <>
                {" "}
                Kamu berhasil menabung{" "}
                <strong className="font-bold text-pos-strong dark:text-pos-dark">
                  {insight.savingsRate}%
                </strong>{" "}
                — bagus! 🎉
              </>
            )}
          </div>
        </Card>
      )}

      <Card className="mb-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
              Apa yang berubah bulan ini?
            </h2>
            <p className="text-muted mt-0.5 text-[13.5px]">
              {previousMonth
                ? `${monthLabel(activeMonth)} dibanding ${monthLabel(previousMonth)}`
                : "Butuh minimal dua bulan data untuk membaca perubahan."}
            </p>
          </div>

          {previousMonth && (
            <Badge tone={importantChanges.length > 0 ? "amber" : "green"}>
              {importantChanges.length > 0 ? `${importantChanges.length} insight` : "stabil"}
            </Badge>
          )}
        </div>

        {!previousMonth ? (
          <div className="rounded-xl bg-surface-sunken px-4 py-5 text-center dark:bg-white/5">
            <div className="mb-2 text-[30px]">🌱</div>
            <p className="text-muted text-[13.5px]">
              Tambahkan transaksi di bulan lain agar Noto bisa membandingkan pola pengeluaranmu.
            </p>
          </div>
        ) : importantChanges.length === 0 ? (
          <div className="rounded-xl bg-pos-soft/60 px-4 py-4 dark:bg-pos/[0.07]">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pos/15 text-pos-strong dark:text-pos-dark">
                <CheckCircle2 size={19} />
              </span>
              <div>
                <div className="text-heading text-[14px] font-bold">
                  Pengeluaran terlihat stabil
                </div>
                <p className="text-body mt-0.5 text-[13.5px] leading-relaxed">
                  Tidak ada kategori yang naik atau turun secara signifikan dari bulan sebelumnya.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {importantChanges.map((item) => (
              <li
                key={item.category}
                className={`rounded-xl border p-3.5 ${
                  item.status === "warning"
                    ? "border-neg/15 bg-neg-soft/50 dark:bg-neg/10"
                    : item.status === "positive"
                      ? "border-pos/15 bg-pos-soft/50 dark:bg-pos/10"
                      : "border-amber/20 bg-amber-soft/50 dark:bg-amber/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[18px]"
                    style={{ background: `${item.color}22` }}
                  >
                    {item.emoji}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-heading font-semibold">{item.category}</span>
                      <Badge tone={statusTone(item.status)}>
                        {statusIcon(item.status)}
                        {item.status === "warning"
                          ? "naik signifikan"
                          : item.status === "positive"
                            ? "turun bagus"
                            : "baru muncul"}
                      </Badge>
                    </div>

                    <p className="text-body text-[13.5px] leading-relaxed">{item.message}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] font-semibold tabular-nums text-muted">
                      <span>{rpShort(item.previous)}</span>
                      <ArrowRight size={13} />
                      <span className="text-heading">{rpShort(item.current)}</span>
                      {item.pct !== null && (
                        <span
                          className={
                            item.diff >= 0
                              ? "text-neg-strong dark:text-neg-dark"
                              : "text-pos-strong dark:text-pos-dark"
                          }
                        >
                          {item.diff >= 0 ? "+" : ""}
                          {item.pct}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
            Pengeluaran per Kategori
          </h2>
          <p className="text-muted mb-3 mt-0.5 text-[13.5px] font-medium">
            Total {rpShort(totalOut)}
          </p>

          {expenseCats.length > 0 ? (
            <>
              <div className="relative mx-auto h-[180px] w-full max-w-[220px]">
                <DonutChart data={expenseCats} formatValue={(v) => rpShort(v)} innerRadius={54} />
              </div>

              <ul className="mt-4 space-y-2">
                {expenseCats.slice(0, 5).map((c) => (
                  <li key={c.name} className="flex items-center gap-2.5 text-[13.5px]">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: c.color }}
                    />
                    <span className="text-body font-medium">
                      {catEmoji(c.name)} {c.name}
                    </span>
                    <span className="text-muted ml-auto font-semibold tabular-nums">
                      {rpShort(c.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-subtle py-12 text-center text-[14px]">
              Belum ada pengeluaran bulan ini.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
            Arus Kas Bulanan
          </h2>
          <p className="text-muted mb-4 mt-0.5 text-[13.5px] font-medium">
            {flow.length} bulan tercatat
          </p>

          <div className="mb-3 flex items-center gap-3 text-[12.5px] font-semibold">
            <span className="text-muted flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-pos" />
              Masuk
            </span>
            <span className="text-muted flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-neg" />
              Keluar
            </span>
          </div>

          <CashFlowChart data={flow} />
        </Card>
      </section>

      <Card className="mb-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 rounded-xl bg-surface-sunken p-1 dark:bg-white/[.04]">
            {(["all", "income", "expense"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`min-h-[38px] flex-1 rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition ${
                  typeFilter === t
                    ? "bg-white text-heading shadow-sm dark:bg-white/[.10] dark:text-white"
                    : "text-muted hover:text-heading"
                }`}
              >
                {t === "all" ? "Semua" : t === "income" ? "Masuk" : "Keluar"}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search
              size={15}
              className="text-subtle absolute left-3.5 top-1/2 -translate-y-1/2"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kategori atau catatan…"
              className="text-heading min-h-[44px] w-full rounded-xl border border-black/[.07] bg-surface-sunken py-2.5 pl-9 pr-4 text-[14px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-heading font-serif text-[18px] font-semibold">
              {activeMonth ? monthLabel(activeMonth) : "Semua"}
            </h2>
            <p className="text-muted mt-0.5 text-[12.5px]">
              Riwayat transaksi yang kamu catat.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-surface-sunken px-3 py-1.5 text-[12px] font-bold text-muted dark:bg-white/[.05]">
            {filtered.length} transaksi
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mb-3 text-[34px]">🧾</div>
            <div className="text-heading mb-1 font-serif text-[17px] font-semibold">
              Belum ada transaksi
            </div>
            <div className="text-muted mb-5 text-[13.5px]">
              Mulai catat pemasukan & pengeluaranmu.
            </div>
            <Button onClick={openNew} className="mx-auto">
              <Plus size={16} /> Catat sekarang
            </Button>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {filtered.map((t) => (
              <TransactionItem key={t.id} tx={t} onEdit={openEdit} onDelete={setDeleteId} />
            ))}
          </ul>
        )}
      </Card>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Hapus transaksi?"
        message="Transaksi ini akan dihapus permanen."
      />
    </>
  );
}