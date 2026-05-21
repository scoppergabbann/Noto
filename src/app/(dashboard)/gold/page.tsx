"use client";

import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GoldValueChart } from "@/components/charts/GoldValueChart";
import { goldAssets } from "@/data/mock";
import {
  remainingGrams,
  currentGoldValue,
  goldProfitLoss,
  goldProfitPct,
  avgBuyPricePerGram,
} from "@/lib/finance";
import { rpShort, rpFull } from "@/lib/format";

export default function GoldPage() {
  const totalGrams = goldAssets.reduce((s, g) => s + remainingGrams(g.boughtGrams, g.soldGrams), 0);
  const totalNow = goldAssets.reduce(
    (s, g) => s + currentGoldValue(g.boughtGrams, g.soldGrams, g.currentPricePerGram),
    0
  );
  const totalPL = goldAssets.reduce(
    (s, g) =>
      s +
      goldProfitLoss(g.buyValue, g.usedValue, g.boughtGrams, g.soldGrams, g.currentPricePerGram),
    0
  );
  const profit = totalPL >= 0;

  return (
    <>
      <PageHeader
        eyebrow="Emas & Investasi"
        title={
          <>
            Emasmu, <em className="italic text-amber-deep">tumbuh perlahan</em>.
          </>
        }
        action={
          <Button>
            <Plus size={17} strokeWidth={2.4} /> Catat emas
          </Button>
        }
      />

      <div className="stagger mb-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Emas Tersimpan
          </div>
          <div className="serif mt-2 text-[30px] font-semibold leading-none tracking-tight">
            {totalGrams.toFixed(1)}
            <span className="text-[16px] text-ink-faint"> gr</span>
          </div>
        </Card>
        <Card hoverable>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Estimasi Nilai Kini
          </div>
          <div className="serif mt-2 text-[30px] font-semibold leading-none tracking-tight">
            {rpShort(totalNow)}
          </div>
        </Card>
        <Card hoverable className={profit ? "" : ""}>
          <div className="text-[13.5px] font-medium text-ink-dim dark:text-slate-400">
            Profit / Loss
          </div>
          <div
            className={`serif mt-2 text-[30px] font-semibold leading-none tracking-tight ${profit ? "text-brand-green" : "text-brand-red"}`}
          >
            {profit ? "+" : ""}
            {rpShort(totalPL)}
          </div>
          <div className="mt-[11px] text-[13px]">
            <Badge tone={profit ? "green" : "red"}>
              {profit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {profit ? "untung" : "rugi"}
            </Badge>
          </div>
        </Card>
      </div>

      <Card className="mb-[18px]">
        <div className="serif mb-1 text-[19px] font-semibold">Pertumbuhan Nilai Emas</div>
        <div className="mb-2 text-[13.5px] text-ink-dim dark:text-slate-400">
          Estimasi nilai total, 6 bulan terakhir
        </div>
        <GoldValueChart />
      </Card>

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
        {goldAssets.map((g) => {
          const grams = remainingGrams(g.boughtGrams, g.soldGrams);
          const now = currentGoldValue(g.boughtGrams, g.soldGrams, g.currentPricePerGram);
          const pl = goldProfitLoss(
            g.buyValue,
            g.usedValue,
            g.boughtGrams,
            g.soldGrams,
            g.currentPricePerGram
          );
          const plPct = goldProfitPct(
            g.buyValue,
            g.usedValue,
            g.boughtGrams,
            g.soldGrams,
            g.currentPricePerGram
          );
          const avg = avgBuyPricePerGram(g.buyValue, g.boughtGrams);
          const up = pl >= 0;
          return (
            <Card key={g.id} hoverable>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-amber/15 text-[22px]">
                  🪙
                </div>
                <div className="flex-1">
                  <div className="text-base font-semibold">{g.item}</div>
                  <Badge tone={g.category === "investment" ? "indigo" : "green"}>
                    {g.category === "investment" ? "Investment" : "Savings"}
                  </Badge>
                </div>
                <div className={`text-right ${up ? "text-brand-green" : "text-brand-red"}`}>
                  <div className="serif text-[20px] font-semibold">
                    {up ? "+" : ""}
                    {plPct}%
                  </div>
                  <div className="text-[12px]">
                    {up ? "+" : ""}
                    {rpShort(pl)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-black/5 pt-4 text-[13px] dark:border-white/5">
                <Row label="Tersimpan" value={`${grams.toFixed(2)} gr`} />
                <Row label="Estimasi kini" value={rpShort(now)} />
                <Row label="Harga beli rata2" value={`${rpFull(avg)}/gr`} />
                <Row label="Harga kini" value={`${rpFull(g.currentPricePerGram)}/gr`} />
              </div>
              {g.notes && <div className="mt-3 text-[12.5px] text-ink-faint">📝 {g.notes}</div>}
            </Card>
          );
        })}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11.5px] text-ink-dim dark:text-slate-400">{label}</div>
      <div className="text-[14px] font-semibold">{value}</div>
    </div>
  );
}
