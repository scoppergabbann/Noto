"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AssetForm, type AssetDraft } from "./AssetForm";
import { useAssetsStore } from "@/lib/stores";
import { rpShort } from "@/lib/format";
import type { OtherAsset } from "@/types";

export default function AssetsPage() {
  const { items, add, update, remove } = useAssetsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OtherAsset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const total = items.reduce((s, a) => s + a.currentValue, 0);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(a: OtherAsset) {
    setEditing(a);
    setFormOpen(true);
  }
  function handleSubmit(d: AssetDraft) {
    editing ? update(editing.id, d) : add(d);
  }

  return (
    <>
      <PageHeader
        eyebrow="Asset Lainnya"
        title={
          <>
            Semua yang kamu <em className="italic text-amber-deep">miliki</em>.
          </>
        }
        action={
          <Button onClick={openNew}>
            <Plus size={17} strokeWidth={2.4} /> Tambah aset
          </Button>
        }
      />

      <Card hoverable className="mb-[18px]">
        <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
          Total Nilai Aset Lainnya
        </div>
        <div className="serif mt-2 text-[34px] font-semibold leading-none tracking-tight">
          {rpShort(total)}
        </div>
        <div className="mt-[11px] text-[13px] text-ink-dim dark:text-slate-400">
          {items.length} aset tercatat
        </div>
      </Card>

      {items.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mb-3 text-[40px]">📦</div>
          <div className="serif mb-1 text-[19px] font-semibold">Belum ada aset lain</div>
          <div className="mx-auto mb-5 max-w-xs text-[14px] text-ink-dim dark:text-slate-400">
            Catat properti, kendaraan, gadget, atau koleksi yang kamu punya.
          </div>
          <Button onClick={openNew} className="mx-auto">
            <Plus size={17} strokeWidth={2.4} /> Tambah aset
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
          {items.map((a) => (
            <Card key={a.id} hoverable>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-black/[.04] text-[22px] dark:bg-white/10">
                  {a.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold">{a.item}</div>
                  <div className="text-[13px] text-ink-dim dark:text-slate-400">
                    {a.quantity} {a.unit}
                  </div>
                </div>
                <RowActions onEdit={() => openEdit(a)} onDelete={() => setDeleteId(a.id)} />
              </div>
              <div className="border-t border-black/5 pt-3.5 dark:border-white/5">
                <div className="text-[11.5px] text-ink-dim dark:text-slate-400">Nilai saat ini</div>
                <div className="serif text-[22px] font-semibold">{rpShort(a.currentValue)}</div>
              </div>
              {a.notes && <div className="mt-3 text-[12.5px] text-ink-faint">📝 {a.notes}</div>}
            </Card>
          ))}
        </div>
      )}

      <AssetForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Hapus aset?"
        message="Aset ini akan dihapus permanen."
      />
    </>
  );
}
