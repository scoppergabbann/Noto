"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { rpShort } from "@/lib/format";

export type NetWorthChartPoint = {
  month: string;
  asset: number;
  liability: number;
};

export function NetWorthChart({ data }: { data: NetWorthChartPoint[] }) {
  if (!data.length) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-2xl bg-surface-sunken px-6 text-center dark:bg-white/[.04]">
        <div>
          <div className="mb-2 text-[32px]" aria-hidden="true">
            📊
          </div>
          <p className="text-heading font-semibold">Belum ada data kekayaan</p>
          <p className="text-muted mt-1 text-[13.5px] leading-relaxed">
            Tambahkan data aset dan kewajiban agar grafik bisa terbentuk.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f9d6b" stopOpacity={0.26} />
              <stop offset="100%" stopColor="#0f9d6b" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="liabilityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d83a3a" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#d83a3a" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="currentColor"
            strokeOpacity={0.08}
            vertical={false}
            className="text-subtle"
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fontWeight: 700 }}
            stroke="currentColor"
            className="text-subtle"
            dy={8}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fontWeight: 700 }}
            stroke="currentColor"
            className="text-subtle"
            width={54}
            tickFormatter={(value) => rpShort(Number(value))}
          />

          <Tooltip
            formatter={(value: number, name: string) => [
              rpShort(Number(value)),
              name === "asset" ? "Aset" : "Utang",
            ]}
            contentStyle={{
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,.10)",
              background: "rgba(15,17,23,.94)",
              color: "#fff",
              boxShadow: "0 18px 50px rgba(0,0,0,.25)",
            }}
            labelStyle={{
              color: "#fff",
              fontWeight: 700,
              marginBottom: 6,
            }}
          />

          <Area
            type="monotone"
            dataKey="asset"
            name="asset"
            stroke="#0f9d6b"
            strokeWidth={3}
            fill="url(#assetGrad)"
            dot={{ r: 5, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />

          <Area
            type="monotone"
            dataKey="liability"
            name="liability"
            stroke="#d83a3a"
            strokeWidth={3}
            strokeDasharray="6 6"
            fill="url(#liabilityGrad)"
            dot={{ r: 5, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}