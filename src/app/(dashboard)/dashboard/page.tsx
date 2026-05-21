"use client";

import { Plus, TrendingUp, TrendingDown, Star } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { NetWorthChart } from "@/components/charts/NetWorthChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { HealthGauge } from "@/components/charts/HealthGauge";
import { goals, assetComposition } from "@/data/mock";
import { progressPct } from "@/lib/finance";
import { rpShort } from "@/lib/format";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kamis, 21 Mei"
        title={
          <>
            Halo Rangga, kekayaanmu <em className="italic text-amber-deep">tumbuh</em> bulan ini.
          </>
        }
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber to-amber-deep px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(240,125,16,.30)] transition hover:-translate-y-px">
            <Plus size={17} strokeWidth={2.4} />
            <span className="hidden sm:inline">Catat transaksi</span>
            <span className="sm:hidden">Catat</span>
          </button>
        }
      />

      <div className="stagger mb-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Aset"
          value="Rp133,0jt"
          delta="▲ 6,8%"
          sub="vs bulan lalu"
          icon={<TrendingUp size={19} />}
          iconClass="bg-brand-green/10 text-brand-green"
        />
        <StatCard
          label="Total Utang"
          value="Rp25,0jt"
          delta="▼ 7,4%"
          sub="berkurang, bagus!"
          icon={<TrendingDown size={19} />}
          iconClass="bg-brand-red/10 text-brand-red"
        />
        <StatCard
          dark
          label="Kekayaan Bersih"
          value="Rp108,0jt"
          delta="▲ 9,1%"
          sub="tren positif 6 bulan"
          icon={<Star size={19} />}
          iconClass="bg-amber/20 text-amber"
        />
      </div>

      <div className="mb-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1.7fr_1fr]">
        <Card>
          <div className="mb-[18px] flex items-center justify-between">
            <div>
              <div className="serif text-[19px] font-semibold">Pertumbuhan Kekayaan</div>
              <div className="text-[13.5px] text-ink-dim dark:text-slate-400">
                Aset vs kewajiban, 8 bulan terakhir
              </div>
            </div>
            <span className="rounded-md bg-brand-green/10 px-2 py-1 text-[11.5px] font-semibold text-brand-green">
              Sehat
            </span>
          </div>
          <NetWorthChart />
        </Card>

        <Card>
          <div className="serif mb-1.5 text-[19px] font-semibold">Komposisi Aset</div>
          <div className="mb-2 text-[13.5px] text-ink-dim dark:text-slate-400">
            Sebaran kekayaanmu
          </div>
          <div className="mx-auto h-[160px] w-full max-w-[220px]">
            <DonutChart data={assetComposition} formatValue={(v) => `${v}%`} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-ink-dim dark:text-slate-400">
            {assetComposition.map((a) => (
              <span key={a.name} className="flex items-center gap-1.5">
                <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: a.color }} />
                {a.name} {a.value}%
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <div className="serif mb-1 text-[19px] font-semibold">Skor Kesehatan Finansial</div>
          <div className="mb-[18px] text-[13.5px] text-ink-dim dark:text-slate-400">
            Berdasarkan rasio aset & utang
          </div>
          <div className="flex items-center gap-5">
            <HealthGauge score={82} />
            <div>
              <div className="mb-1 text-[15px] font-semibold">Kondisi Baik 👍</div>
              <div className="text-[13px] text-ink-dim dark:text-slate-400">
                Rasio utangmu 18,8% dari total aset — masih jauh di bawah ambang aman 35%.
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-1.5 flex items-center justify-between">
            <div className="serif text-[19px] font-semibold">Financial Goals</div>
            <Link
              href="/cash"
              className="text-[13.5px] font-semibold text-amber-deep hover:underline"
            >
              Lihat semua →
            </Link>
          </div>
          {goals.map((g) => {
            const p = progressPct(g.usedAmount, g.targetAmount);
            return (
              <div
                key={g.id}
                className="flex items-center gap-3.5 border-b border-black/5 py-[15px] last:border-0 dark:border-white/5"
              >
                <div
                  className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl text-[19px]"
                  style={{ background: `${g.color}1a` }}
                >
                  {g.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-[7px] flex justify-between gap-2.5">
                    <div className="text-[14.5px] font-semibold">{g.item}</div>
                    <div className="text-[13px] text-ink-dim dark:text-slate-400">
                      {rpShort(g.usedAmount)}{" "}
                      <span className="text-ink-faint">/ {rpShort(g.targetAmount)}</span>
                    </div>
                  </div>
                  <ProgressBar value={p} color={g.color} />
                </div>
                <div
                  className="w-[42px] text-right text-[14px] font-bold"
                  style={{ color: g.color }}
                >
                  {p}%
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </>
  );
}
