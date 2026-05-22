"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { RowActions } from "@/components/ui/RowActions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CardForm, type CardDraft } from "./CardForm";
import { useCardsStore } from "@/lib/stores";
import { utilization, isHighUtilization } from "@/lib/finance";
import { rpShort } from "@/lib/format";
import type { CreditCard } from "@/types";

export default function CardsPage() {
  const { items, add, update, remove } = useCardsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CreditCard | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

      {items.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mb-3 text-[40px]">💳</div>
          <div className="mb-1 font-serif text-[19px] font-semibold">Belum ada kartu</div>
          <div className="mx-auto mb-5 max-w-xs text-[14px] text-ink-dim dark:text-slate-400">
            Tambahkan kartu kredit untuk memantau utilisasi & tagihan.
          </div>
          <Button onClick={openNew} className="mx-auto">
            <Plus size={17} strokeWidth={2.4} /> Tambah kartu
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {items.map((c) => {
            const util = utilization(c.spent, c.limit);
            const bill = c.spent - c.paid;
            const warn = isHighUtilization(c.spent, c.limit);
            const suggested = (c.spent - c.limit * 0.3) / 1e6;
            return (
              <div key={c.id}>
                <div
                  className="cc relative flex min-h-[188px] flex-col justify-between overflow-hidden rounded-[20px] p-6 text-white shadow-[0_16px_40px_rgba(16,16,24,.22)]"
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
                      <div className="text-[15px] font-semibold">{rpShort(c.limit)}</div>
                    </div>
                  </div>
                </div>
                <Card className="-mt-3.5 rounded-t-none pt-7">
                  <div className="mb-[9px] flex items-center justify-between">
                    <div className="text-[13.5px] font-semibold">Utilisasi kartu</div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`rounded-md px-2 py-1 text-[11.5px] font-semibold ${warn ? "bg-brand-red/10 text-brand-red" : "bg-brand-green/10 text-brand-green"}`}
                      >
                        {util}% {warn ? "· tinggi ⚠️" : "· aman"}
                      </span>
                      <RowActions onEdit={() => openEdit(c)} onDelete={() => setDeleteId(c.id)} />
                    </div>
                  </div>
                  <ProgressBar value={util} color={warn ? "#e0524a" : "#1f9e6f"} height={10} />
                  <div className="mt-4 grid grid-cols-3 gap-2.5">
                    <div>
                      <div className="text-[11.5px] text-ink-dim dark:text-slate-400">
                        Pemakaian
                      </div>
                      <div className="text-[14px] font-semibold">{rpShort(c.spent)}</div>
                    </div>
                    <div>
                      <div className="text-[11.5px] text-ink-dim dark:text-slate-400">Dibayar</div>
                      <div className="text-[14px] font-semibold text-brand-green">
                        {rpShort(c.paid)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11.5px] text-ink-dim dark:text-slate-400">Tersedia</div>
                      <div className="text-[14px] font-semibold">{rpShort(c.limit - c.spent)}</div>
                    </div>
                  </div>
                  {warn && (
                    <div className="mt-3.5 rounded-xl bg-brand-red/10 px-3.5 py-2.5 text-[12.5px] font-medium text-brand-red">
                      ⚠️ Pemakaian di atas 70%. Pertimbangkan bayar Rp
                      {suggested.toFixed(1).replace(".", ",")}jt untuk turun ke zona aman.
                    </div>
                  )}
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
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        title="Hapus kartu?"
        message="Data kartu ini akan dihapus permanen."
      />
    </>
  );
}
