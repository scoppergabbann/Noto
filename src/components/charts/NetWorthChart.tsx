"use client";

import {
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
} from "recharts";
import { netWorthSeries } from "@/data/mock";

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-black/[.06] bg-white/95 px-3 py-2.5 shadow-softlg backdrop-blur dark:border-white/10 dark:bg-night-raised2/95">
      <div className="text-heading mb-1.5 text-[12px] font-bold">{label} 2026</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[12.5px]">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted">{p.name === "asset" ? "Aset" : "Utang"}</span>
          <span className="text-heading ml-auto font-semibold tabular-nums">Rp{p.value}jt</span>
        </div>
      ))}
    </div>
  );
}

export function NetWorthChart() {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={netWorthSeries} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="assetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f9d6b" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#0f9d6b" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            width={48}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "#f59425", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="asset"
            stroke="#0f9d6b"
            strokeWidth={2.5}
            fill="url(#assetFill)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="liability"
            stroke="#d83a3a"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
