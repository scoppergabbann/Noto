"use client";

import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { goals } from "@/data/mock";
import { progressPct, remaining, monthlyTarget } from "@/lib/finance";
import { rpShort } from "@/lib/format";

export default function CashPage() {
  return (
    <>
      <PageHeader
        eyebrow="Asset Cash Tracker"
        title={
          <>
            Target tabungan <em className="italic text-amber-deep">yang terukur</em>.
          </>
        }
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber to-amber-deep px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(240,125,16,.30)] transition hover:-translate-y-px">
            <Plus size={17} strokeWidth={2.4} /> Target baru
          </button>
        }
      />

      <div className="stagger mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Total Terkumpul
          </div>
          <div className="serif mt-2 text-[30px] font-semibold leading-none tracking-tight">
            Rp40,7jt
          </div>
          <div className="mt-[11px] text-[13px] text-ink-dim dark:text-slate-400">
            dari target Rp70,0jt
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Target Bulanan
          </div>
          <div className="serif mt-2 text-[30px] font-semibold leading-none tracking-tight">
            Rp4,2jt
          </div>
          <div className="mt-[11px] text-[13px]">
            <span className="rounded-lg bg-brand-green/10 px-2 py-0.5 text-[12.5px] font-semibold text-brand-green">
              on track
            </span>
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Goal Aktif
          </div>
          <div className="serif mt-2 text-[30px] font-semibold leading-none tracking-tight">3</div>
          <div className="mt-[11px] text-[13px] text-ink-dim dark:text-slate-400">
            1 hampir tercapai 🎉
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
        {goals.map((g) => {
          const p = progressPct(g.usedAmount, g.targetAmount);
          const left = remaining(g.targetAmount, g.usedAmount);
          const perMonth = monthlyTarget(g.targetAmount, g.usedAmount, 6);
          return (
            <Card key={g.id} hoverable>
              <div className="mb-[18px] flex items-center gap-3">
                <div
                  className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl text-[22px]"
                  style={{ background: `${g.color}1a` }}
                >
                  {g.emoji}
                </div>
                <div className="flex-1">
                  <div className="text-base font-semibold">{g.item}</div>
                  <div className="text-[13px] text-ink-dim dark:text-slate-400">
                    {g.instrument} · {g.deadline}
                  </div>
                </div>
              </div>
              <div className="mb-[9px] flex items-end justify-between">
                <div>
                  <div className="serif text-[24px] font-semibold">{rpShort(g.usedAmount)}</div>
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
                  <div className="text-[11.5px] text-ink-dim dark:text-slate-400">Target / bln</div>
                  <div className="text-[14px] font-semibold">{rpShort(perMonth)}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
