"use client";

import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart } from "recharts";
import { netWorthSeries } from "@/data/mock";

export function NetWorthChart() {
  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={netWorthSeries} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="assetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f9e6f" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#1f9e6f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(128,128,140,.12)" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#9a9ea9" }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9a9ea9" }} tickFormatter={(v) => `${v}jt`} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,.12)", fontSize: 13 }}
            formatter={(v: number, n) => [`Rp${v}jt`, n === "asset" ? "Aset" : "Utang"]}
          />
          <Area type="monotone" dataKey="asset" stroke="#1f9e6f" strokeWidth={2.5} fill="url(#assetFill)" dot={false} />
          <Line type="monotone" dataKey="liability" stroke="#e0524a" strokeWidth={2} strokeDasharray="5 4" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
