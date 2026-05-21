"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { goldValueSeries } from "@/data/mock";

export function GoldValueChart() {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={goldValueSeries} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff9d2e" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ff9d2e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(128,128,140,.12)" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#9a9ea9" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#9a9ea9" }}
            tickFormatter={(v) => `${v}jt`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,.12)",
              fontSize: 13,
            }}
            formatter={(v: number) => [`Rp${v}jt`, "Nilai"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#f07d10"
            strokeWidth={2.5}
            fill="url(#goldFill)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
