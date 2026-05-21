"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { cashFlowSeries } from "@/data/mock";

export function CashFlowChart() {
  return (
    <div className="h-[236px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={cashFlowSeries} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
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
            cursor={{ fill: "rgba(128,128,140,.08)" }}
            contentStyle={{
              borderRadius: 10,
              border: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,.12)",
              fontSize: 13,
            }}
            formatter={(v: number, n) => [`Rp${v}jt`, n === "income" ? "Pemasukan" : "Pengeluaran"]}
          />
          <Bar dataKey="income" fill="#1f9e6f" radius={[6, 6, 0, 0]} />
          <Bar dataKey="spend" fill="#e0524a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
