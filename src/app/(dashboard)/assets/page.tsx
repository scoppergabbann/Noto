"use client";

import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { otherAssets } from "@/data/mock";
import { rpShort } from "@/lib/format";

export default function AssetsPage() {
  const total = otherAssets.reduce((s, a) => s + a.currentValue, 0);

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
          <Button>
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
          {otherAssets.length} aset tercatat
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
        {otherAssets.map((a) => (
          <Card key={a.id} hoverable>
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-black/[.04] text-[22px] dark:bg-white/10">
                {a.emoji}
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold">{a.item}</div>
                <div className="text-[13px] text-ink-dim dark:text-slate-400">
                  {a.quantity} {a.unit}
                </div>
              </div>
            </div>
            <div className="border-t border-black/5 pt-3.5 dark:border-white/5">
              <div className="text-[11.5px] text-ink-dim dark:text-slate-400">Nilai saat ini</div>
              <div className="serif text-[22px] font-semibold">{rpShort(a.currentValue)}</div>
            </div>
            {a.notes && <div className="mt-3 text-[12.5px] text-ink-faint">📝 {a.notes}</div>}
          </Card>
        ))}
      </div>
    </>
  );
}
