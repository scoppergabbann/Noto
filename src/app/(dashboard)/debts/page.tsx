"use client";

import { Plus, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { debts } from "@/data/mock";
import { progressPct, healthScore } from "@/lib/finance";
import { rpShort } from "@/lib/format";

export default function DebtsPage() {
  const totalDebt = debts.reduce((s, d) => s + d.total, 0);
  const totalPaid = debts.reduce((s, d) => s + d.paid, 0);
  const totalLeft = totalDebt - totalPaid;
  // skor sederhana: makin banyak terbayar makin sehat
  const debtHealth = healthScore(totalDebt, totalLeft);

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
          <Button>
            <Plus size={17} strokeWidth={2.4} /> Tambah utang
          </Button>
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Sisa Utang
          </div>
          <div className="serif mt-2 text-[30px] font-semibold leading-none tracking-tight text-brand-red">
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
          <div className="serif mt-2 text-[30px] font-semibold leading-none tracking-tight text-brand-green">
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

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
        {debts.map((d) => {
          const p = progressPct(d.paid, d.total);
          const left = d.total - d.paid;
          return (
            <Card key={d.id} hoverable>
              <div className="mb-3 flex items-start justify-between">
                <div className="text-base font-semibold">{d.item}</div>
                <Badge tone="neutral">
                  <Clock size={12} /> {d.dueDate}
                </Badge>
              </div>
              <div className="mb-[9px] flex items-end justify-between">
                <div>
                  <div className="serif text-[24px] font-semibold text-brand-red">
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
                  <div className="text-[11.5px] text-ink-dim dark:text-slate-400">Jatuh tempo</div>
                  <div className="text-[14px] font-semibold">{d.dueDate}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
