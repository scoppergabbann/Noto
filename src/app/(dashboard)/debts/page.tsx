"use client";

import { useState } from "react";
import { Plus, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DebtForm, type DebtDraft } from "./DebtForm";
import { useDebtsStore } from "@/lib/stores";
import { progressPct, healthScore } from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { Debt } from "@/types";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / 86_400_000);
}

function DueBadge({ dueDate }: { dueDate: string }) {
  const days = daysUntil(dueDate);
  if (days === null) return null;
  const overdue = days < 0;
  const urgent = days >= 0 && days <= 7;
  const tone = overdue
    ? "bg-neg-soft text-neg-strong dark:bg-neg/15 dark:text-neg-dark"
    : urgent
      ? "bg-amber-soft text-amber-text dark:bg-amber/15 dark:text-amber"
      : "bg-surface-sunken text-subtle dark:bg-white/5";
  const label = overdue
    ? `Lewat ${Math.abs(days)} hari`
    : days === 0
      ? "Jatuh tempo hari ini!"
      : `${days} hari lagi`;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[12px] font-bold ${tone}`}
    >
      {label}
    </span>
  );
}

export default function DebtsPage() {
  const { items, loading, error, fetch, add, update, remove } = useDebtsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalDebt = items.reduce((s, d) => s + d.total, 0);
  const totalPaid = items.reduce((s, d) => s + d.paid, 0);
  const totalLeft = totalDebt - totalPaid;
  const debtHealth = healthScore(totalDebt, totalLeft);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(d: Debt) {
    setEditing(d);
    setFormOpen(true);
  }
  function handleSubmit(d: DebtDraft) {
    editing ? update(editing.id, d) : add(d);
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetch} />;

  return (
    <>
      <PageHeader
        eyebrow="Utang & Cicilan Tracker"
        title={
          <>
            Lunasi{" "}
            <em className="italic text-amber-text dark:text-amber">selangkah demi selangkah</em>.
          </>
        }
        action={
          <Button onClick={openNew}>
            <Plus size={17} strokeWidth={2.4} /> Tambah utang
          </Button>
        }
      />

      <div className="stagger mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Sisa Utang
          </div>
          <div className="mt-2 font-serif text-[17px] font-semibold leading-none tracking-tight text-brand-red sm:text-[20px] sm:text-[26px]">
            {rpShort(totalLeft)}
          </div>
          <div className="mt-[11px] text-[13px] text-ink-dim dark:text-slate-400">
            dari {rpShort(totalDebt)}
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Sudah Dibayar
          </div>
          <div className="mt-2 font-serif text-[17px] font-semibold leading-none tracking-tight text-brand-green sm:text-[20px] sm:text-[26px]">
            {rpShort(totalPaid)}
          </div>
          <div className="mt-[11px] text-[13px]">
            <Badge tone="green">{progressPct(totalPaid, totalDebt)}% lunas</Badge>
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Debt Health
          </div>
          <div className="mt-2 font-serif text-[17px] font-semibold leading-none tracking-tight sm:text-[20px] sm:text-[26px]">
            {debtHealth}
            <span className="text-[16px] text-ink-faint">/100</span>
          </div>
          <div className="mt-[11px] text-[13px]">
            {debtHealth >= 60 ? (
              <Badge tone="green">Terkendali</Badge>
            ) : (
              <Badge tone="red">Perlu perhatian</Badge>
            )}
          </div>
        </Card>
      </div>

      {items.length === 0 ? (
        <Card className="py-10 text-center sm:py-14">
          <div className="mb-3 text-[22px] sm:text-[40px]">🏦</div>
          <div className="mb-1 font-serif text-[17px] font-semibold sm:text-[19px]">
            Belum ada utang tercatat
          </div>
          <div className="mx-auto mb-5 max-w-xs text-[14px] text-ink-dim dark:text-slate-400">
            Catat cicilan & utang untuk memantau progress pelunasan.
          </div>
          <Button onClick={openNew} className="mx-auto">
            <Plus size={17} strokeWidth={2.4} /> Tambah utang
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
          {items.map((d) => {
            const p = progressPct(d.paid, d.total);
            const left = d.total - d.paid;
            return (
              <Card key={d.id} hoverable>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 truncate text-base font-semibold">{d.item}</div>
                  <div className="flex shrink-0 items-center gap-1">
                    {d.dueDate && <DueBadge dueDate={d.dueDate} />}
                    <RowActions onEdit={() => openEdit(d)} onDelete={() => setDeleteId(d.id)} />
                  </div>
                </div>
                <div className="mb-[9px] flex items-end justify-between">
                  <div>
                    <div className="font-serif text-[18px] font-semibold text-brand-red sm:text-[22px]">
                      {rpShort(left)}
                    </div>
                    <div className="text-[12.5px] text-ink-dim dark:text-slate-400">
                      sisa dari {rpShort(d.total)}
                    </div>
                  </div>
                  <div className="text-[18px] font-bold text-brand-green">{p}%</div>
                </div>
                <ProgressBar value={p} color="#1f9e6f" height={10} />
                <div className="mt-3.5 flex justify-between border-t border-black/5 pt-3.5 dark:border-white/5">
                  <div>
                    <div className="text-[11.5px] text-ink-dim dark:text-slate-400">Dibayar</div>
                    <div className="text-[14px] font-semibold text-brand-green">
                      {rpShort(d.paid)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11.5px] text-ink-dim dark:text-slate-400">
                      Jatuh tempo
                    </div>
                    <div className="text-[14px] font-semibold">
                      {d.dueDate ? (
                        <DueBadge dueDate={d.dueDate} />
                      ) : (
                        <span className="text-subtle">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <DebtForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Hapus utang?"
        message="Catatan utang ini akan dihapus permanen."
      />
    </>
  );
}
