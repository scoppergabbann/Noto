"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GoalForm, type GoalDraft } from "./GoalForm";
import { useGoalsStore } from "@/lib/stores";
import { progressPct, remaining, monthlyTarget } from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { Goal } from "@/types";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";

export default function CashPage() {
  const { items, loading, error, fetch, add, update, remove } = useGoalsStore();
  const goals = items;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalUsed = goals.reduce((s, g) => s + g.usedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const monthlySum = goals.reduce(
    (s, g) => s + monthlyTarget(g.targetAmount, g.usedAmount, g.durationMonths || 6),
    0
  );
  const almostDone = goals.filter((g) => progressPct(g.usedAmount, g.targetAmount) >= 80).length;

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(g: Goal) {
    setEditing(g);
    setFormOpen(true);
  }
  function handleSubmit(draft: GoalDraft) {
    if (editing) update(editing.id, draft);
    else add(draft);
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetch} />;

  return (
    <>
      <PageHeader
        eyebrow="Asset Cash Tracker"
        title={
          <>
            Target tabungan <em className="italic text-amber-text dark:text-amber">yang terukur</em>
            .
          </>
        }
        action={
          <Button onClick={openNew}>
            <Plus size={17} strokeWidth={2.4} /> Target baru
          </Button>
        }
      />

      <div className="stagger mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Total Terkumpul
          </div>
          <div className="mt-2 font-serif text-[30px] font-semibold leading-none tracking-tight">
            {rpShort(totalUsed)}
          </div>
          <div className="mt-[11px] text-[13px] text-ink-dim dark:text-slate-400">
            dari target {rpShort(totalTarget)}
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Target Bulanan
          </div>
          <div className="mt-2 font-serif text-[30px] font-semibold leading-none tracking-tight">
            {rpShort(monthlySum)}
          </div>
          <div className="mt-[11px] text-[13px] text-ink-dim dark:text-slate-400">
            agar semua goal tercapai
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Goal Aktif
          </div>
          <div className="mt-2 font-serif text-[30px] font-semibold leading-none tracking-tight">
            {goals.length}
          </div>
          <div className="mt-[11px] text-[13px] text-ink-dim dark:text-slate-400">
            {almostDone} hampir tercapai 🎉
          </div>
        </Card>
      </div>

      {goals.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mb-3 text-[40px]">🎯</div>
          <div className="mb-1 font-serif text-[19px] font-semibold">Belum ada target</div>
          <div className="mx-auto mb-5 max-w-xs text-[14px] text-ink-dim dark:text-slate-400">
            Mulai dengan membuat target tabungan pertamamu, mis. dana darurat.
          </div>
          <Button onClick={openNew} className="mx-auto">
            <Plus size={17} strokeWidth={2.4} /> Buat target
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((g) => {
            const p = progressPct(g.usedAmount, g.targetAmount);
            const left = remaining(g.targetAmount, g.usedAmount);
            const perMonth = monthlyTarget(g.targetAmount, g.usedAmount, g.durationMonths || 6);
            return (
              <Card key={g.id} hoverable>
                <div className="mb-[18px] flex items-center gap-3">
                  <div
                    className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl text-[22px]"
                    style={{ background: `${g.color}1a` }}
                  >
                    {g.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold">{g.item}</div>
                    <div className="truncate text-[13px] text-ink-dim dark:text-slate-400">
                      {g.instrument || "—"} · {g.deadline || "tanpa deadline"}
                    </div>
                  </div>
                  <RowActions onEdit={() => openEdit(g)} onDelete={() => setDeleteId(g.id)} />
                </div>
                <div className="mb-[9px] flex items-end justify-between">
                  <div>
                    <div className="font-serif text-[24px] font-semibold">
                      {rpShort(g.usedAmount)}
                    </div>
                    <div className="text-[12.5px] text-ink-dim dark:text-slate-400">
                      dari {rpShort(g.targetAmount)}
                    </div>
                  </div>
                  <div className="text-[18px] font-bold" style={{ color: g.color }}>
                    {p}%
                  </div>
                </div>
                <ProgressBar value={p} color={g.color} height={10} />
                <div className="mt-3.5 flex justify-between border-t border-black/5 pt-3.5 dark:border-white/5">
                  <div>
                    <div className="text-[11.5px] text-ink-dim dark:text-slate-400">Sisa</div>
                    <div className="text-[14px] font-semibold">{rpShort(left)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11.5px] text-ink-dim dark:text-slate-400">
                      Target / bln
                    </div>
                    <div className="text-[14px] font-semibold">{rpShort(perMonth)}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <GoalForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Hapus target?"
        message="Target tabungan ini akan dihapus permanen dari perangkatmu."
      />
    </>
  );
}
