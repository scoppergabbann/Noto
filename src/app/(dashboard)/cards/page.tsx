"use client";

import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { creditCards } from "@/data/mock";
import { utilization, isHighUtilization } from "@/lib/finance";
import { rpShort } from "@/lib/format";

export default function CardsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Credit Card"
        title={
          <>
            Kartu kreditmu, <em className="italic text-amber-deep">terpantau</em>.
          </>
        }
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber to-amber-deep px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(240,125,16,.30)] transition hover:-translate-y-px">
            <Plus size={17} strokeWidth={2.4} /> Tambah kartu
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {creditCards.map((c) => {
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
                  <div className="text-[13px] font-semibold tracking-wide opacity-90">{c.name}</div>
                </div>
                <div className="relative z-10 text-[18px] font-medium tabular-nums tracking-[.16em]">
                  •••• •••• •••• {c.last4}
                </div>
                <div className="relative z-10 flex items-end justify-between">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-[.1em] opacity-65">
                      Sisa Tagihan
                    </div>
                    <div className="serif text-[21px] font-semibold">{rpShort(bill)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10.5px] uppercase tracking-[.1em] opacity-65">Limit</div>
                    <div className="text-[15px] font-semibold">{rpShort(c.limit)}</div>
                  </div>
                </div>
              </div>

              <Card className="-mt-3.5 rounded-t-none pt-7">
                <div className="mb-[9px] flex items-center justify-between">
                  <div className="text-[13.5px] font-semibold">Utilisasi kartu</div>
                  <span
                    className={`rounded-md px-2 py-1 text-[11.5px] font-semibold ${warn ? "bg-brand-red/10 text-brand-red" : "bg-brand-green/10 text-brand-green"}`}
                  >
                    {util}% {warn ? "· tinggi ⚠️" : "· aman"}
                  </span>
                </div>
                <ProgressBar value={util} color={warn ? "#e0524a" : "#1f9e6f"} height={10} />
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  <div>
                    <div className="text-[11.5px] text-ink-dim dark:text-slate-400">Pemakaian</div>
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
    </>
  );
}
