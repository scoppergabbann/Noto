"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ReceivableForm, type ReceivableDraft } from "./ReceivableForm";
import { useReceivablesStore } from "@/lib/stores";
import { progressPct } from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { Receivable } from "@/types";

export default function ReceivablesPage() {
  const { items, add, update, remove } = useReceivablesStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Receivable | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalActive = items.reduce((s, r) => s + (r.total - r.paid), 0);
  const totalAll = items.reduce((s, r) => s + r.total, 0);
  const totalPaid = items.reduce((s, r) => s + r.paid, 0);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(r: Receivable) {
    setEditing(r);
    setFormOpen(true);
  }
  function handleSubmit(d: ReceivableDraft) {
    editing ? update(editing.id, d) : add(d);
  }

  return (
    <>
      <PageHeader
        eyebrow="Piutang Tracker"
        title={
          <>
            Siapa yang <em className="italic text-amber-text dark:text-amber">berutang</em> padamu.
          </>
        }
        action={
          <Button onClick={openNew}>
            <Plus size={17} strokeWidth={2.4} /> Tambah piutang
          </Button>
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Piutang Aktif
          </div>
          <div className="mt-2 font-serif text-[30px] font-semibold leading-none tracking-tight text-amber-text dark:text-amber">
            {rpShort(totalActive)}
          </div>
          <div className="mt-[11px] text-[13px] text-ink-dim dark:text-slate-400">
            belum tertagih
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Total Piutang
          </div>
          <div className="mt-2 font-serif text-[30px] font-semibold leading-none tracking-tight">
            {rpShort(totalAll)}
          </div>
          <div className="mt-[11px] text-[13px] text-ink-dim dark:text-slate-400">
            {items.length} catatan
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Sudah Diterima
          </div>
          <div className="mt-2 font-serif text-[30px] font-semibold leading-none tracking-tight text-brand-green">
            {rpShort(totalPaid)}
          </div>
          <div className="mt-[11px] text-[13px]">
            <Badge tone="green">{progressPct(totalPaid, totalAll)}% terlunasi</Badge>
          </div>
        </Card>
      </div>

      {items.length === 0 ? (
        <EmptyState onClick={openNew} />
      ) : (
        <Card>
          {items.map((r) => {
            const p = progressPct(r.paid, r.total);
            const lunas = p >= 100;
            return (
              <div
                key={r.id}
                className="flex items-center gap-3.5 border-b border-black/5 py-4 last:border-0 dark:border-white/5"
              >
                <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-brand-indigo/10 text-[17px]">
                  🤝
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-[7px] flex flex-wrap items-center justify-between gap-x-2.5 gap-y-1">
                    <div className="flex items-center gap-2 text-[14.5px] font-semibold">
                      {r.item}
                      {lunas ? (
                        <Badge tone="green">Lunas</Badge>
                      ) : (
                        <Badge tone="amber">Berjalan</Badge>
                      )}
                    </div>
                    <div className="text-[13px] text-ink-dim dark:text-slate-400">
                      {rpShort(r.paid)} <span className="text-ink-faint">/ {rpShort(r.total)}</span>
                    </div>
                  </div>
                  <ProgressBar value={p} color={lunas ? "#1f9e6f" : "#6b6ff0"} />
                </div>
                <RowActions onEdit={() => openEdit(r)} onDelete={() => setDeleteId(r.id)} />
              </div>
            );
          })}
        </Card>
      )}

      <ReceivableForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Hapus piutang?"
        message="Catatan piutang ini akan dihapus permanen."
      />
    </>
  );
}

function EmptyState({ onClick }: { onClick: () => void }) {
  return (
    <Card className="py-16 text-center">
      <div className="mb-3 text-[40px]">🤝</div>
      <div className="mb-1 font-serif text-[19px] font-semibold">Belum ada piutang</div>
      <div className="mx-auto mb-5 max-w-xs text-[14px] text-ink-dim dark:text-slate-400">
        Catat uang yang dipinjam orang lain agar tidak lupa ditagih.
      </div>
      <Button onClick={onClick} className="mx-auto">
        <Plus size={17} strokeWidth={2.4} /> Tambah piutang
      </Button>
    </Card>
  );
}
