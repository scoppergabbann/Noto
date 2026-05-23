"use client";

import { useState } from "react";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { StockForm, type StockDraft } from "./StockForm";
import { useStocksStore } from "@/lib/stores";
import {
  stockMarketValue,
  stockCostBasis,
  stockUnrealizedPL,
  stockUnrealizedPct,
  stockTotalReturn,
} from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { StockHolding } from "@/types";

export default function StocksPage() {
  const { items, loading, error, fetch, add, update, remove } = useStocksStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StockHolding | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalMarket = items.reduce((s, h) => s + stockMarketValue(h.lots, h.currentPrice), 0);
  const totalCost = items.reduce((s, h) => s + stockCostBasis(h.lots, h.avgPrice), 0);
  const totalUPL = totalMarket - totalCost;
  const totalDividend = items.reduce((s, h) => s + h.dividendReceived, 0);
  const totalReturn = totalUPL + totalDividend;
  const up = totalReturn >= 0;

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

      <div className="stagger mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Nilai Pasar", rpShort(totalMarket), ""],
          ["Modal", rpShort(totalCost), ""],
          [
            "Unrealized P&L",
            `${totalUPL >= 0 ? "+" : ""}${rpShort(totalUPL)}`,
            totalUPL >= 0
              ? "text-pos-strong dark:text-pos-dark"
              : "text-neg-strong dark:text-neg-dark",
          ],
          [
            "Total Return",
            `${up ? "+" : ""}${rpShort(totalReturn)}`,
            up ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark",
          ],
        ].map(([label, value, cls]) => (
          <Card key={label} hoverable>
            <div className="text-muted text-[13px] font-semibold">{label}</div>
            <div
              className={`text-heading mt-2 font-serif text-[24px] font-semibold tabular-nums leading-none ${cls}`}
            >
              {value}
            </div>
            {label === "Total Return" && (
              <div className="text-subtle mt-2 text-[12px]">+dividen {rpShort(totalDividend)}</div>
            )}
          </Card>
        ))}
      </div>

      {items.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mb-3 text-[42px]">📈</div>
          <div className="text-heading mb-1 font-serif text-[19px] font-semibold">
            Belum ada saham
          </div>
          <div className="text-muted mx-auto mb-5 max-w-xs text-[14px]">
            Catat portofolio sahammu dan pantau P&L secara real-time.
          </div>
          <Button onClick={openNew} className="mx-auto">
            <Plus size={17} strokeWidth={2.5} /> Tambah saham
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((h) => {
            const market = stockMarketValue(h.lots, h.currentPrice);
            const upl = stockUnrealizedPL(h.lots, h.avgPrice, h.currentPrice);
            const uplPct = stockUnrealizedPct(h.avgPrice, h.currentPrice);
            const total = stockTotalReturn(h.lots, h.avgPrice, h.currentPrice, h.dividendReceived);
            const isUp = upl >= 0;
            return (
              <Card key={h.id} hoverable>
                <div className="mb-4 flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-[11px] font-black text-indigo-500">
                    {h.ticker}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-heading truncate text-[15px] font-bold">{h.ticker}</div>
                    <div className="text-muted truncate text-[12.5px]">{h.name}</div>
                    <Badge tone="indigo">{h.exchange}</Badge>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-serif text-[20px] font-semibold tabular-nums ${isUp ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark"}`}
                    >
                      {isUp ? "+" : ""}
                      {uplPct}%
                    </div>
                    <div
                      className={`text-[12px] font-medium ${isUp ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark"}`}
                    >
                      {isUp ? "+" : ""}
                      {rpShort(upl)}
                    </div>
                  </div>
                  <RowActions onEdit={() => openEdit(h)} onDelete={() => setDeleteId(h.id)} />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-black/5 pt-4 dark:border-white/5">
                  {[
                    ["Lot", `${h.lots} lot (${(h.lots * 100).toLocaleString("id-ID")} lbr)`],
                    ["Nilai Pasar", rpShort(market)],
                    ["Harga Beli", `Rp${h.avgPrice.toLocaleString("id-ID")}`],
                    ["Harga Kini", `Rp${h.currentPrice.toLocaleString("id-ID")}`],
                    ["Dividen", rpShort(h.dividendReceived)],
                    ["Total Return", rpShort(total)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-subtle text-[11.5px] font-semibold">{label}</div>
                      <div className="text-heading text-[13.5px] font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
                {h.notes && <div className="text-subtle mt-3 text-[12.5px]">📝 {h.notes}</div>}
                <div
                  className={`mt-3 flex items-center gap-1.5 text-[13px] font-semibold ${isUp ? "text-pos-strong dark:text-pos-dark" : "text-neg-strong dark:text-neg-dark"}`}
                >
                  {isUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                  {isUp ? "Unrealized profit" : "Unrealized loss"} {rpShort(Math.abs(upl))}
                </div>
              </Card>
            );
          })}
        </div>
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
        message="Data saham ini akan dihapus permanen."
      />
    </>
  );
}
