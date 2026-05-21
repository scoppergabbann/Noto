"use client";

import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { receivables } from "@/data/mock";
import { progressPct } from "@/lib/finance";
import { rpShort } from "@/lib/format";

export default function ReceivablesPage() {
  const totalActive = receivables.reduce((s, r) => s + (r.total - r.paid), 0);
  const totalAll = receivables.reduce((s, r) => s + r.total, 0);
  const totalPaid = receivables.reduce((s, r) => s + r.paid, 0);

  return (
    <>
      <PageHeader
        eyebrow="Piutang Tracker"
        title={
          <>
            Siapa yang <em className="italic text-amber-deep">berutang</em> padamu.
          </>
        }
        action={
          <Button>
            <Plus size={17} strokeWidth={2.4} /> Tambah piutang
          </Button>
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Piutang Aktif
          </div>
          <div className="serif mt-2 text-[30px] font-semibold leading-none tracking-tight text-amber-deep">
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
          <div className="serif mt-2 text-[30px] font-semibold leading-none tracking-tight">
            {rpShort(totalAll)}
          </div>
          <div className="mt-[11px] text-[13px] text-ink-dim dark:text-slate-400">
            {receivables.length} catatan
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Sudah Diterima
          </div>
          <div className="serif mt-2 text-[30px] font-semibold leading-none tracking-tight text-brand-green">
            {rpShort(totalPaid)}
          </div>
          <div className="mt-[11px] text-[13px]">
            <Badge tone="green">{progressPct(totalPaid, totalAll)}% terlunasi</Badge>
          </div>
        </Card>
      </div>

      <Card>
        {receivables.map((r) => {
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
              <div
                className="w-[42px] text-right text-[14px] font-bold"
                style={{ color: lunas ? "#1f9e6f" : "#6b6ff0" }}
              >
                {p}%
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
