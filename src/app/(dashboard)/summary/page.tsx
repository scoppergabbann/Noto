"use client";

import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { DonutChart } from "@/components/charts/DonutChart";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { spending, summaryRows } from "@/data/mock";
import { rpShort } from "@/lib/format";

export default function SummaryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Financial Summary · Februari 2026"
        title={
          <>
            Ke mana <em className="italic text-amber-text dark:text-amber">uangmu</em> pergi bulan
            ini.
          </>
        }
        action={
          <button className="inline-flex items-center gap-2 rounded-xl border border-black/[.08] bg-white px-4 py-2.5 text-sm font-semibold transition hover:shadow-soft dark:border-white/10 dark:bg-white/5">
            Ekspor PDF
          </button>
        }
      />

      <div className="stagger mb-[18px] grid grid-cols-2 gap-[18px] lg:grid-cols-4">
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Pemasukan
          </div>
          <div className="mt-2 font-serif text-[24px] font-semibold leading-none tracking-tight text-brand-green sm:text-[30px]">
            Rp17,2jt
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Pengeluaran
          </div>
          <div className="mt-2 font-serif text-[24px] font-semibold leading-none tracking-tight text-brand-red sm:text-[30px]">
            Rp9,8jt
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">Ditabung</div>
          <div className="mt-2 font-serif text-[24px] font-semibold leading-none tracking-tight sm:text-[30px]">
            Rp4,2jt
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Sisa Uang
          </div>
          <div className="mt-2 font-serif text-[24px] font-semibold leading-none tracking-tight sm:text-[30px]">
            Rp3,2jt
          </div>
        </Card>
      </div>

      <div className="mb-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <div className="mb-1 font-serif text-[19px] font-semibold">Pengeluaran per Kategori</div>
          <div className="mb-2.5 text-[13.5px] text-ink-dim dark:text-slate-400">Total Rp9,8jt</div>
          <div className="mx-auto h-[200px] w-full max-w-[240px]">
            <DonutChart data={spending} formatValue={(v) => rpShort(v)} innerRadius={52} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-ink-dim dark:text-slate-400">
            {spending.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5">
                <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <div className="mb-1 font-serif text-[19px] font-semibold">Arus Kas Bulanan</div>
          <div className="mb-[18px] text-[13.5px] text-ink-dim dark:text-slate-400">
            Pemasukan vs pengeluaran, 6 bulan
          </div>
          <CashFlowChart />
        </Card>
      </div>

      <Card>
        <div className="mb-3.5 font-serif text-[19px] font-semibold">Rincian Bulan Ini</div>
        {summaryRows.map((r) => (
          <div
            key={r.label}
            className="flex items-center border-b border-black/5 py-3 last:border-0 dark:border-white/5"
          >
            <div className="flex-1 text-[14px] text-ink-dim dark:text-slate-400">{r.label}</div>
            <div
              className={`text-[14.5px] font-semibold tabular-nums ${r.tone === "green" ? "text-brand-green" : r.tone === "red" ? "text-brand-red" : ""}`}
            >
              {r.value}
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}
