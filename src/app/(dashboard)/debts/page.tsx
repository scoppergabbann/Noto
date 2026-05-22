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

export default function DebtsPage() {
  const { items, add, update, remove } = useDebtsStore();
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

  return (
    <>
      <PageHeader
        eyebrow="Utang & Cicilan Tracker"
        title={
          <>
            Lunasi <em className="italic text-amber-deep">selangkah demi selangkah</em>.
          </>
        }
        action={
          <Button onClick={openNew}>
            <Plus size={17} strokeWidth={2.4} /> Tambah utang
          </Button>
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Sisa Utang
          </div>
          <div className="serif text-brand-red mt-2 text-[30px] font-semibold leading-none tracking-tight">
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
          <div className="serif text-brand-green mt-2 text-[30px] font-semibold leading-none tracking-tight">
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
          <div className="serif mt-2 text-[30px] font-semibold leading-none tracking-tight">
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
        <Card className="py-16 text-center">
          <div className="mb-3 text-[40px]">🏦</div>
          <div className="serif mb-1 text-[19px] font-semibold">Belum ada utang tercatat</div>
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
                    {d.dueDate && (
                      <Badge tone="neutral">
                        <Clock size={12} /> {d.dueDate}
                      </Badge>
                    )}
                    <RowActions onEdit={() => openEdit(d)} onDelete={() => setDeleteId(d.id)} />
                  </div>
                </div>
                <div className="mb-[9px] flex items-end justify-between">
                  <div>
                    <div className="serif text-brand-red text-[24px] font-semibold">
                      {rpShort(left)}
                    </div>
                    <div className="text-[12.5px] text-ink-dim dark:text-slate-400">
                      sisa dari {rpShort(d.total)}
                    </div>
                  </div>
                  <div className="text-brand-green text-[18px] font-bold">{p}%</div>
                </div>
                <ProgressBar value={p} color="#1f9e6f" height={10} />
                <div className="mt-3.5 flex justify-between border-t border-black/5 pt-3.5 dark:border-white/5">
                  <div>
                    <div className="text-[11.5px] text-ink-dim dark:text-slate-400">Dibayar</div>
                    <div className="text-brand-green text-[14px] font-semibold">
                      {rpShort(d.paid)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11.5px] text-ink-dim dark:text-slate-400">
                      Jatuh tempo
                    </div>
                    <div className="text-[14px] font-semibold">{d.dueDate || "—"}</div>
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
