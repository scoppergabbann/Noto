"use client";

import { useState } from "react";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GoldValueChart } from "@/components/charts/GoldValueChart";
import { GoldForm, type GoldDraft } from "./GoldForm";
import { useGoldStore } from "@/lib/stores";
import {
  remainingGrams,
  currentGoldValue,
  goldProfitLoss,
  goldProfitPct,
  avgBuyPricePerGram,
} from "@/lib/finance";
import { rpShort, rpFull } from "@/lib/format";
import type { GoldAsset } from "@/types";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";

export default function GoldPage() {
  const { items, loading, error, fetch, add, update, remove } = useGoldStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GoldAsset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalGrams = items.reduce((s, g) => s + remainingGrams(g.boughtGrams, g.soldGrams), 0);
  const totalNow = items.reduce(
    (s, g) => s + currentGoldValue(g.boughtGrams, g.soldGrams, g.currentPricePerGram),
    0
  );
  const totalPL = items.reduce(
    (s, g) =>
      s +
      goldProfitLoss(g.buyValue, g.usedValue, g.boughtGrams, g.soldGrams, g.currentPricePerGram),
    0
  );
  const profit = totalPL >= 0;

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(g: GoldAsset) {
    setEditing(g);
    setFormOpen(true);
  }
  function handleSubmit(d: GoldDraft) {
    editing ? update(editing.id, d) : add(d);
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetch} />;

  return (
    <>
      <PageHeader
        eyebrow="Emas & Investasi"
        title={
          <>
            Emasmu, <em className="italic text-amber-text dark:text-amber">tumbuh perlahan</em>.
          </>
        }
        action={
          <Button onClick={openNew}>
            <Plus size={17} strokeWidth={2.4} /> Catat emas
          </Button>
        }
      />

      <div className="stagger mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Emas Tersimpan
          </div>
          <div className="mt-2 font-serif text-[17px] font-semibold leading-none tracking-tight sm:text-[20px] sm:text-[26px]">
            {totalGrams.toFixed(1)}
            <span className="text-[16px] text-ink-faint"> gr</span>
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Estimasi Nilai Kini
          </div>
          <div className="mt-2 font-serif text-[17px] font-semibold leading-none tracking-tight sm:text-[20px] sm:text-[26px]">
            {rpShort(totalNow)}
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Profit / Loss
          </div>
          <div
            className={`serif mt-2 text-[17px] font-semibold leading-none tracking-tight sm:text-[20px] sm:text-[26px] ${profit ? "text-brand-green" : "text-brand-red"}`}
          >
            {profit ? "+" : ""}
            {rpShort(totalPL)}
          </div>
          <div className="mt-[11px] text-[13px]">
            <Badge tone={profit ? "green" : "red"}>
              {profit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {profit ? "untung" : "rugi"}
            </Badge>
          </div>
        </Card>
      </div>

      {items.length === 0 ? (
        <Card className="py-10 text-center sm:py-14">
          <div className="mb-3 text-[22px] sm:text-[40px]">🪙</div>
          <div className="mb-1 font-serif text-[17px] font-semibold sm:text-[19px]">
            Belum ada catatan emas
          </div>
          <div className="mx-auto mb-5 max-w-xs text-[14px] text-ink-dim dark:text-slate-400">
            Catat pembelian emasmu untuk memantau profit/loss otomatis.
          </div>
          <Button onClick={openNew} className="mx-auto">
            <Plus size={17} strokeWidth={2.4} /> Catat emas
          </Button>
        </Card>
      ) : (
        <>
          <Card className="mb-[18px]">
            <div className="mb-1 font-serif text-[17px] font-semibold sm:text-[19px]">
              Pertumbuhan Nilai Emas
            </div>
            <div className="mb-2 text-[13.5px] text-ink-dim dark:text-slate-400">
              Estimasi nilai total, 6 bulan terakhir
            </div>
            <GoldValueChart />
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {items.map((g) => {
              const grams = remainingGrams(g.boughtGrams, g.soldGrams);
              const now = currentGoldValue(g.boughtGrams, g.soldGrams, g.currentPricePerGram);
              const pl = goldProfitLoss(
                g.buyValue,
                g.usedValue,
                g.boughtGrams,
                g.soldGrams,
                g.currentPricePerGram
              );
              const plPct = goldProfitPct(
                g.buyValue,
                g.usedValue,
                g.boughtGrams,
                g.soldGrams,
                g.currentPricePerGram
              );
              const avg = avgBuyPricePerGram(g.buyValue, g.boughtGrams);
              const up = pl >= 0;
              return (
                <Card key={g.id} hoverable>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-amber/15 text-[18px] sm:text-[22px]">
                      🪙
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-semibold">{g.item}</div>
                      <Badge tone={g.category === "investment" ? "indigo" : "green"}>
                        {g.category === "investment" ? "Investment" : "Savings"}
                      </Badge>
                    </div>
                    <div className={`text-right ${up ? "text-brand-green" : "text-brand-red"}`}>
                      <div className="font-serif text-[17px] font-semibold sm:text-[20px]">
                        {up ? "+" : ""}
                        {plPct}%
                      </div>
                      <div className="text-[12px]">
                        {up ? "+" : ""}
                        {rpShort(pl)}
                      </div>
                    </div>
                    <RowActions onEdit={() => openEdit(g)} onDelete={() => setDeleteId(g.id)} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-black/5 pt-4 text-[13px] dark:border-white/5">
                    <Row label="Tersimpan" value={`${grams.toFixed(2)} gr`} />
                    <Row label="Estimasi kini" value={rpShort(now)} />
                    <Row label="Harga beli rata2" value={`${rpFull(avg)}/gr`} />
                    <Row label="Harga kini" value={`${rpFull(g.currentPricePerGram)}/gr`} />
                  </div>
                  {g.notes && <div className="mt-3 text-[12.5px] text-ink-faint">📝 {g.notes}</div>}
                </Card>
              );
            })}
          </div>
        </>
      )}

      <GoldForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Hapus catatan emas?"
        message="Catatan emas ini akan dihapus permanen."
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11.5px] text-ink-dim dark:text-slate-400">{label}</div>
      <div className="text-[14px] font-semibold">{value}</div>
    </div>
  );
}
