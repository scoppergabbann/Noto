"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-black/[.06] bg-white/95 px-3 py-2.5 shadow-softlg backdrop-blur dark:border-white/10 dark:bg-night-raised2/95">
      <div className="text-heading mb-1.5 text-[12px] font-bold">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[12.5px]">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted">{p.name === "income" ? "Masuk" : "Keluar"}</span>
          <span className="text-heading ml-auto font-semibold tabular-nums">Rp{p.value}jt</span>
        </div>
      ))}
    </div>
  );
}

export function CashFlowChart({
  data,
}: {
  data: { month: string; income: number; expense: number }[];
}) {
  return (
    <div className="h-[236px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid
            stroke="currentColor"
            strokeOpacity={0.08}
            vertical={false}
            className="text-ink-subtle"
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12.5, fontWeight: 600 }}
            stroke="currentColor"
            className="text-subtle"
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fontWeight: 600 }}
            stroke="currentColor"
            className="text-subtle"
            tickFormatter={(v) => `${v}jt`}
            width={44}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.05 }} />
          <Bar dataKey="income" fill="#0f9d6b" radius={[6, 6, 0, 0]} barSize={18} />
          <Bar dataKey="expense" fill="#d83a3a" radius={[6, 6, 0, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
