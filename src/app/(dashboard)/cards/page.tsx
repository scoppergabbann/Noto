"use client";

import { useMemo, useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { CardForm, type CardDraft } from "./CardForm";
import { CardTxForm, type CardTxDraft } from "./CardTxForm";
import { useCardsStore, useCardTxStore } from "@/lib/stores";
import { utilization, isHighUtilization } from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { CreditCard, CardTransaction } from "@/types";

export default function CardsPage() {
  const { items: cards, loading, error, fetch, add, update, remove } = useCardsStore();
  const { items: txs, add: addTx, update: updateTx, remove: removeTx } = useCardTxStore();

  const [formOpen, setFormOpen] = useState(false);
  const [txFormOpen, setTxFormOpen] = useState(false);
  const [editing, setEditing] = useState<CreditCard | null>(null);
  const [editingTx, setEditingTx] = useState<CardTransaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [activeTxCard, setActiveTxCard] = useState<CreditCard | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(c: CreditCard) {
    setEditing(c);
    setFormOpen(true);
  }
  function handleSubmit(d: CardDraft) {
    editing ? update(editing.id, d) : add(d);
  }

  function openTxForm(card: CreditCard) {
    setActiveTxCard(card);
    setEditingTx(null);
    setTxFormOpen(true);
  }
  function openEditTx(card: CreditCard, tx: CardTransaction) {
    setActiveTxCard(card);
    setEditingTx(tx);
    setTxFormOpen(true);
  }
  function handleTxSubmit(d: CardTxDraft) {
    editingTx ? updateTx(editingTx.id, d) : addTx(d);
  }

  // Group transactions by cardId
  const txByCard = useMemo(() => {
    const map: Record<string, CardTransaction[]> = {};
    txs.forEach((t) => {
      if (!map[t.cardId]) map[t.cardId] = [];
      map[t.cardId].push(t);
    });
    return map;
  }, [txs]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetch} />;

  return (
    <>
      <PageHeader
        eyebrow="Credit Card"
        title={
          <>
            Kartu kreditmu, <em className="italic text-amber-text dark:text-amber">terpantau</em>.
          </>
        }
        action={
          <Button onClick={openNew}>
            <Plus size={17} strokeWidth={2.4} /> Tambah kartu
          </Button>
        }
      />

      {cards.length === 0 ? (
        <Card className="py-10 text-center sm:py-14">
          <div className="mb-3 text-[22px] sm:text-[40px]">💳</div>
          <div className="text-heading mb-1 font-serif text-[17px] font-semibold sm:text-[19px]">
            Belum ada kartu
          </div>
          <div className="text-muted mx-auto mb-5 max-w-xs text-[14px]">
            Tambahkan kartu kredit untuk memantau utilisasi & catat transaksi per kartu.
          </div>
          <Button onClick={openNew} className="mx-auto">
            <Plus size={17} strokeWidth={2.4} /> Tambah kartu
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {cards.map((c) => {
            const util = utilization(c.spent, c.creditLimit);
            const bill = c.spent - c.paid;
            const warn = isHighUtilization(c.spent, c.creditLimit);
            const cardTxs = txByCard[c.id] ?? [];
            const isExpanded = expandedCard === c.id;
            const monthSpend = cardTxs.reduce((s, t) => s + t.amount, 0);

            return (
              <div key={c.id}>
                {/* Card visual */}
                <div
                  className="cc relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-[20px] p-5 text-white shadow-[0_16px_40px_rgba(16,16,24,.22)] sm:min-h-[188px] sm:p-6"
                  style={{ background: c.gradient }}
                >
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="h-7 w-[38px] rounded-md bg-gradient-to-br from-[#f5d486] to-[#c79a3e] opacity-90" />
                    <div className="text-[13px] font-semibold tracking-wide opacity-90">
                      {c.name}
                    </div>
                  </div>
                  <div className="relative z-10 text-[18px] font-medium tabular-nums tracking-[.16em]">
                    •••• •••• •••• {c.last4 || "0000"}
                  </div>
                  <div className="relative z-10 flex items-end justify-between">
                    <div>
                      <div className="text-[10.5px] uppercase tracking-[.1em] opacity-65">
                        Sisa Tagihan
                      </div>
                      <div className="font-serif text-[21px] font-semibold">{rpShort(bill)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10.5px] uppercase tracking-[.1em] opacity-65">
                        Limit
                      </div>
                      <div className="text-[15px] font-semibold">{rpShort(c.creditLimit)}</div>
                    </div>
                  </div>
                </div>

                {/* Stats panel */}
                <Card className="-mt-3.5 rounded-t-none pt-7">
                  {/* Utilization */}
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-heading text-[13.5px] font-semibold">Utilisasi kartu</div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-md px-2 py-1 text-[11.5px] font-semibold ${
                          warn
                            ? "bg-neg-soft text-neg-strong dark:bg-neg/15 dark:text-neg-dark"
                            : "bg-pos-soft text-pos-strong dark:bg-pos/15 dark:text-pos-dark"
                        }`}
                      >
                        {util}% {warn ? "· ⚠️ tinggi" : "· aman"}
                      </span>
                      <RowActions onEdit={() => openEdit(c)} onDelete={() => setDeleteId(c.id)} />
                    </div>
                  </div>

                  <ProgressBar value={util} color={warn ? "#d83a3a" : "#0f9d6b"} height={10} />

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      ["Pemakaian", rpShort(c.spent), ""],
                      ["Dibayar", rpShort(c.paid), "text-pos-strong dark:text-pos-dark"],
                      ["Tersedia", rpShort(c.creditLimit - c.spent), ""],
                    ].map(([label, value, cls]) => (
                      <div key={label}>
                        <div className="text-muted text-[11.5px]">{label}</div>
                        <div className={`text-heading text-[14px] font-semibold ${cls}`}>
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {warn && (
                    <div className="mt-3.5 rounded-xl bg-neg-soft px-3.5 py-2.5 text-[12.5px] font-medium text-neg-strong dark:bg-neg/15 dark:text-neg-dark">
                      ⚠️ Pemakaian di atas 70%. Pertimbangkan bayar{" "}
                      {rpShort(c.spent - c.creditLimit * 0.3)} untuk turun ke zona aman.
                    </div>
                  )}

                  {/* Transactions section */}
                  <div className="mt-4 border-t border-black/5 pt-4 dark:border-white/5">
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : c.id)}
                        className="text-heading flex items-center gap-1.5 text-[13.5px] font-semibold"
                      >
                        <Receipt size={15} className="text-muted" />
                        Transaksi ({cardTxs.length})
                        {monthSpend > 0 && (
                          <span className="text-muted text-[12px] font-medium">
                            · {rpShort(monthSpend)}
                          </span>
                        )}
                        <span className="text-subtle ml-1 text-[11px]">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </button>
                      <button
                        onClick={() => openTxForm(c)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-amber-text transition hover:bg-amber-soft dark:text-amber dark:hover:bg-amber/10"
                      >
                        <Plus size={13} strokeWidth={2.5} /> Catat
                      </button>
                    </div>

                    {isExpanded && (
                      <ul>
                        {cardTxs.length === 0 ? (
                          <li className="text-subtle py-5 text-center text-[13px]">
                            Belum ada transaksi untuk kartu ini.
                          </li>
                        ) : (
                          [...cardTxs]
                            .sort((a, b) => b.date.localeCompare(a.date))
                            .map((tx) => (
                              <li
                                key={tx.id}
                                className="flex items-center gap-3 border-b border-black/5 py-2.5 last:border-0 dark:border-white/5"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-heading truncate text-[13.5px] font-semibold">
                                    {tx.merchant}
                                  </div>
                                  <div className="text-subtle text-[12px]">
                                    {tx.category} · {tx.date}
                                  </div>
                                </div>
                                <span className="shrink-0 font-serif text-[14px] font-bold tabular-nums text-neg-strong dark:text-neg-dark">
                                  {rpShort(tx.amount)}
                                </span>
                                <RowActions
                                  onEdit={() => openEditTx(c, tx)}
                                  onDelete={() => setDeleteTxId(tx.id)}
                                />
                              </li>
                            ))
                        )}
                      </ul>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <CardForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
      <CardTxForm
        open={txFormOpen}
        onClose={() => setTxFormOpen(false)}
        onSubmit={handleTxSubmit}
        cardId={activeTxCard?.id ?? ""}
        cardName={activeTxCard?.name ?? ""}
        initial={editingTx}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Hapus kartu?"
        message="Semua data kartu dan transaksinya akan dihapus."
      />
      <ConfirmDialog
        open={!!deleteTxId}
        onClose={() => setDeleteTxId(null)}
        onConfirm={() => deleteTxId && removeTx(deleteTxId)}
        title="Hapus transaksi?"
        message="Transaksi ini akan dihapus permanen."
      />
    </>
  );
}
