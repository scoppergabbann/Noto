"use client";

import { useMemo, useState } from "react";
import { Plus, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DonutChart } from "@/components/charts/DonutChart";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { TransactionForm, type TxDraft } from "@/components/forms/TransactionForm";
import { useTransactionsStore } from "@/lib/stores";
import { expenseCategories } from "@/data/mock";
import {
  availableMonths,
  monthLabel,
  monthShort,
  txInMonth,
  byCategory,
  cashflowSeries,
  monthInsight,
} from "@/lib/analytics";
import { rpShort } from "@/lib/format";
import type { Transaction } from "@/types";

const catColor = (name: string) =>
  expenseCategories.find((c) => c.name === name)?.color ?? "#64748b";
const catEmoji = (name: string) => expenseCategories.find((c) => c.name === name)?.emoji ?? "📦";

export default function SummaryPage() {
  const { items, add, update, remove } = useTransactionsStore();

  const months = useMemo(() => availableMonths(items), [items]);
  const [month, setMonth] = useState<string>("");
  const activeMonth = month || months[months.length - 1] || "";

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const insight = useMemo(() => monthInsight(items, activeMonth), [items, activeMonth]);
  const monthTx = useMemo(() => txInMonth(items, activeMonth), [items, activeMonth]);
  const expenseCats = useMemo(
    () => byCategory(monthTx, "expense").map((c) => ({ ...c, color: catColor(c.name) })),
    [monthTx]
  );
  const flow = useMemo(() => cashflowSeries(items, 6), [items]);
  const recent = useMemo(
    () => [...monthTx].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    [monthTx]
  );

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

  return (
    <>
      <PageHeader
        eyebrow={`Financial Summary · ${activeMonth ? monthLabel(activeMonth) : "—"}`}
        title={
          <>
            Ke mana <em className="italic text-amber-text dark:text-amber">uangmu</em> pergi.
          </>
        }
        action={
          <Button onClick={openNew}>
            <Plus size={17} strokeWidth={2.5} /> Catat transaksi
          </Button>
        }
      />

      {/* month selector */}
      {months.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
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

      {/* stat row */}
      <section className="stagger mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Pemasukan</div>
          <div className="mt-2 font-serif text-[24px] font-semibold tabular-nums leading-none tracking-tight text-pos-strong dark:text-pos-dark sm:text-[28px]">
            {rpShort(insight.income)}
          </div>
        </Card>
        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Pengeluaran</div>
          <div className="mt-2 font-serif text-[24px] font-semibold tabular-nums leading-none tracking-tight text-neg-strong dark:text-neg-dark sm:text-[28px]">
            {rpShort(insight.expense)}
          </div>
          {insight.expenseChange !== null && (
            <div className="mt-2">
              <Badge tone={insight.expenseChange <= 0 ? "green" : "red"}>
                {insight.expenseChange <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {Math.abs(insight.expenseChange)}% vs lalu
              </Badge>
            </div>
          )}
        </Card>
        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Ditabung</div>
          <div className="text-heading mt-2 font-serif text-[24px] font-semibold tabular-nums leading-none tracking-tight sm:text-[28px]">
            {rpShort(insight.saved)}
          </div>
        </Card>
        <Card hoverable>
          <div className="text-muted text-[13px] font-semibold">Savings Rate</div>
          <div className="text-heading mt-2 font-serif text-[24px] font-semibold tabular-nums leading-none tracking-tight sm:text-[28px]">
            {insight.savingsRate}%
          </div>
          <div className="mt-2">
            <Badge
              tone={
                insight.savingsRate >= 20 ? "green" : insight.savingsRate >= 10 ? "amber" : "red"
              }
            >
              {insight.savingsRate >= 20 ? "sehat" : insight.savingsRate >= 10 ? "cukup" : "tipis"}
            </Badge>
          </div>
        </Card>
      </section>

      {/* insight banner */}
      {insight.topCategory && (
        <Card className="mb-5 flex items-start gap-3.5 !bg-amber-soft/60 dark:!bg-amber/[0.07]">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber-text dark:text-amber">
            <Lightbulb size={20} />
          </span>
          <div className="text-body text-[13.5px] leading-relaxed">
            Bulan ini pengeluaran terbesarmu di{" "}
            <strong className="text-heading font-bold">{insight.topCategory.name}</strong> sebesar{" "}
            <strong className="text-heading font-bold">{rpShort(insight.topCategory.value)}</strong>
            {insight.expenseChange !== null && insight.expenseChange > 10 && (
              <>
                {" "}
                — total belanja naik{" "}
                <strong className="font-bold text-neg-strong dark:text-neg-dark">
                  {insight.expenseChange}%
                </strong>{" "}
                dari bulan lalu. Mungkin waktunya cek lagi?
              </>
            )}
            {insight.savingsRate >= 20 && (
              <>
                {" "}
                Kamu berhasil menabung{" "}
                <strong className="font-bold text-pos-strong dark:text-pos-dark">
                  {insight.savingsRate}%
                </strong>{" "}
                dari pemasukan — kerja bagus! 🎉
              </>
            )}
          </div>
        </Card>
      )}

      {/* charts */}
      <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <h2 className="text-heading font-serif text-[20px] font-semibold">
            Pengeluaran per Kategori
          </h2>
          <p className="text-muted mb-3 mt-0.5 text-[13.5px] font-medium">
            Total {rpShort(insight.expense)}
          </p>
          {expenseCats.length > 0 ? (
            <>
              <div className="relative mx-auto h-[200px] w-full max-w-[230px]">
                <DonutChart data={expenseCats} formatValue={(v) => rpShort(v)} innerRadius={54} />
              </div>
              <ul className="mt-4 space-y-2">
                {expenseCats.map((c) => (
                  <li key={c.name} className="flex items-center gap-2.5 text-[13.5px]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
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
          <h2 className="text-heading font-serif text-[20px] font-semibold">Arus Kas Bulanan</h2>
          <p className="text-muted mb-4 mt-0.5 text-[13.5px] font-medium">
            Pemasukan vs pengeluaran · {flow.length} bulan
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

      {/* recent transactions */}
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-heading font-serif text-[20px] font-semibold">
            Transaksi {activeMonth ? monthLabel(activeMonth) : ""}
          </h2>
          <span className="text-subtle text-[13px] font-medium">{monthTx.length} transaksi</span>
        </div>
        {recent.length > 0 ? (
          <ul>
            {recent.map((t) => {
              const inc = t.type === "income";
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3.5 border-b border-black/5 py-3 last:border-0 dark:border-white/5"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[17px]"
                    style={{
                      background: inc ? "rgba(15,157,107,.12)" : `${catColor(t.category)}1f`,
                    }}
                  >
                    {inc ? "💰" : catEmoji(t.category)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-heading truncate text-[14.5px] font-semibold">
                      {t.category}
                    </div>
                    <div className="text-subtle truncate text-[12.5px]">
                      {t.note || (inc ? "Pemasukan" : "Pengeluaran")} · {t.date}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[14.5px] font-bold tabular-nums ${inc ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark"}`}
                  >
                    {inc ? "+" : "−"}
                    {rpShort(t.amount)}
                  </span>
                  <RowActions onEdit={() => openEdit(t)} onDelete={() => setDeleteId(t.id)} />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <div className="mb-3 text-[40px]">🧾</div>
            <div className="text-heading mb-1 font-serif text-[18px] font-semibold">
              Belum ada transaksi
            </div>
            <div className="text-muted mx-auto mb-5 max-w-xs text-[14px]">
              Catat pemasukan & pengeluaran untuk melihat analitik bulananmu.
            </div>
            <Button onClick={openNew} className="mx-auto">
              <Plus size={17} strokeWidth={2.5} /> Catat transaksi
            </Button>
          </div>
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
