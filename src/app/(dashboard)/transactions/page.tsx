"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Search,
  Lightbulb,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RowActions } from "@/components/ui/RowActions";
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

const catEmoji = (name: string) =>
  allCats.find((c) => c.name === name)?.emoji ?? "💸";

const catColor = (name: string) =>
  allCats.find((c) => c.name === name)?.color ?? "#64748b";

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

  const monthTx = useMemo(
    () => (activeMonth ? txInMonth(items, activeMonth) : items),
    [items, activeMonth]
  );

  const insight = useMemo(
    () => monthInsight(items, activeMonth),
    [items, activeMonth]
  );

  const expenseCats = useMemo(
    () =>
      byCategory(monthTx, "expense").map((c) => ({
        ...c,
        color: catColor(c.name),
      })),
    [monthTx]
  );

  const flow = useMemo(() => cashflowSeries(items, 6), [items]);

  const filtered = useMemo(() => {
    let list = activeMonth ? txInMonth(items, activeMonth) : items;

    if (typeFilter !== "all") {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          t.note?.toLowerCase().includes(q)
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

      {/* Month selector */}
      {months.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              className={`rounded-xl px-3.5 py-2 text-[13px] font-semibold transition ${
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

      {/* Stats */}
      <section className="stagger mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Pemasukan</div>
          <div className="mt-2 font-serif text-[22px] font-semibold tabular-nums text-pos-strong dark:text-pos-dark sm:text-[28px]">
            {rpShort(insight.income)}
          </div>
        </Card>

        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Pengeluaran</div>
          <div className="mt-2 font-serif text-[22px] font-semibold tabular-nums text-neg-strong dark:text-neg-dark sm:text-[28px]">
            {rpShort(insight.expense)}
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
                insight.savingsRate >= 20
                  ? "green"
                  : insight.savingsRate >= 10
                    ? "amber"
                    : "red"
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

      {/* Insight banner */}
      {insight.topCategory && (
        <Card className="mb-5 flex items-start gap-3.5 !bg-amber-soft/60 dark:!bg-amber/[0.07]">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber-text dark:text-amber">
            <Lightbulb size={20} />
          </span>

          <div className="text-body text-[13.5px] leading-relaxed">
            Bulan ini pengeluaran terbesarmu di{" "}
            <strong className="text-heading font-bold">
              {insight.topCategory.name}
            </strong>{" "}
            sebesar{" "}
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

      {/* Charts */}
      <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <h2 className="text-heading font-serif text-[17px] font-semibold sm:text-[20px]">
            Pengeluaran per Kategori
          </h2>
          <p className="text-muted mb-3 mt-0.5 text-[13.5px] font-medium">
            Total {rpShort(insight.expense)}
          </p>

          {expenseCats.length > 0 ? (
            <>
              <div className="relative mx-auto h-[180px] w-full max-w-[220px]">
                <DonutChart
                  data={expenseCats}
                  formatValue={(v) => rpShort(v)}
                  innerRadius={54}
                />
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
            {flow.length} bulan terakhir
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

      {/* Filter + search */}
      <Card className="mb-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            {(["all", "income", "expense"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition ${
                  typeFilter === t
                    ? "bg-ink text-white dark:bg-white dark:text-ink"
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
              className="text-heading w-full rounded-xl border border-black/[.07] bg-surface-sunken py-2.5 pl-9 pr-4 text-[14px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5"
            />
          </div>
        </div>
      </Card>

      {/* Transactions list */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-heading font-serif text-[18px] font-semibold">
            {activeMonth ? monthLabel(activeMonth) : "Semua"}
          </h2>
          <span className="text-subtle text-[13px] font-medium">
            {filtered.length} transaksi
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mb-3 text-[22px] sm:text-[40px]">🧾</div>
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
          <ul>
            {filtered.map((t) => {
              const inc = t.type === "income";

              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3.5 border-b border-black/5 py-3 last:border-0 dark:border-white/5"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[18px]"
                    style={{
                      background: inc
                        ? "rgba(15,157,107,.12)"
                        : `${catColor(t.category)}1f`,
                    }}
                  >
                    {catEmoji(t.category)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-heading truncate text-[14.5px] font-semibold">
                        {t.category}
                      </span>
                      <Badge tone={inc ? "green" : "red"}>
                        {inc ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {inc ? "masuk" : "keluar"}
                      </Badge>
                    </div>
                    <div className="text-subtle truncate text-[12.5px]">
                      {t.note || "—"} · {t.date}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 font-serif text-[15px] font-bold tabular-nums ${
                      inc
                        ? "text-pos-strong dark:text-pos-dark"
                        : "text-neg-strong dark:text-neg-dark"
                    }`}
                  >
                    {inc ? "+" : "−"}
                    {rpShort(t.amount)}
                  </span>

                  <RowActions onEdit={() => openEdit(t)} onDelete={() => setDeleteId(t.id)} />
                </li>
              );
            })}
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