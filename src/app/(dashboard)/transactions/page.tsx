"use client";

import { useMemo, useState } from "react";
import { Plus, TrendingUp, TrendingDown, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { TransactionForm, type TxDraft } from "@/components/forms/TransactionForm";
import { useTransactionsStore } from "@/lib/stores";
import { expenseCategories, incomeCategories } from "@/data/mock";
import { availableMonths, monthLabel, txInMonth, sumByType } from "@/lib/analytics";
import { rpShort } from "@/lib/format";
import type { Transaction } from "@/types";

const allCats = [...expenseCategories, ...incomeCategories];
const catEmoji = (name: string) => allCats.find((c) => c.name === name)?.emoji ?? "💸";
const catColor = (name: string) => allCats.find((c) => c.name === name)?.color ?? "#64748b";

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

  const filtered = useMemo(() => {
    let list = activeMonth ? txInMonth(items, activeMonth) : items;
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.category.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [items, activeMonth, typeFilter, search]);

  const monthTx = useMemo(() => txInMonth(items, activeMonth), [items, activeMonth]);
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
        eyebrow="Transaksi"
        title={
          <>
            Semua keluar <em className="italic text-amber-text dark:text-amber">masuk</em> uangmu.
          </>
        }
        action={
          <Button onClick={openNew}>
            <Plus size={17} strokeWidth={2.5} /> Catat transaksi
          </Button>
        }
      />

      <div className="stagger mb-4 grid grid-cols-3 gap-2">
        <Card hoverable>
          <div className="text-muted text-[12.5px] font-semibold">Pemasukan</div>
          <div className="mt-1.5 font-serif text-[18px] font-semibold tabular-nums text-pos-strong dark:text-pos-dark sm:text-[22px] sm:text-[26px]">
            {rpShort(totalIn)}
          </div>
        </Card>
        <Card hoverable>
          <div className="text-muted text-[12.5px] font-semibold">Pengeluaran</div>
          <div className="mt-1.5 font-serif text-[18px] font-semibold tabular-nums text-neg-strong dark:text-neg-dark sm:text-[22px] sm:text-[26px]">
            {rpShort(totalOut)}
          </div>
        </Card>
        <Card hoverable>
          <div className="text-muted text-[12.5px] font-semibold">Selisih</div>
          <div
            className={`mt-1.5 font-serif text-[18px] font-semibold tabular-nums sm:text-[22px] sm:text-[26px] ${net >= 0 ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark"}`}
          >
            {net >= 0 ? "+" : ""}
            {rpShort(net)}
          </div>
        </Card>
      </div>

      <Card className="mb-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setMonth(m)}
                className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition ${m === activeMonth ? "bg-amber text-white shadow-glow" : "text-muted hover:text-heading bg-surface-sunken dark:bg-white/5"}`}
              >
                {monthLabel(m)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "income", "expense"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition ${typeFilter === t ? "bg-ink text-white dark:bg-white dark:text-ink" : "text-muted hover:text-heading"}`}
              >
                {t === "all" ? "Semua" : t === "income" ? "Masuk" : "Keluar"}
              </button>
            ))}
          </div>
        </div>
        <div className="relative mt-3">
          <Search size={15} className="text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kategori atau catatan…"
            className="text-heading w-full rounded-xl border border-black/[.07] bg-surface-sunken py-2.5 pl-9 pr-4 text-[14px] outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-white/10 dark:bg-white/5"
          />
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-heading font-serif text-[18px] font-semibold">
            {activeMonth ? monthLabel(activeMonth) : "Semua"}
          </h2>
          <span className="text-subtle text-[13px] font-medium">{filtered.length} transaksi</span>
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
                      background: inc ? "rgba(15,157,107,.12)" : `${catColor(t.category)}1f`,
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
                    className={`shrink-0 font-serif text-[15px] font-bold tabular-nums ${inc ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark"}`}
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
