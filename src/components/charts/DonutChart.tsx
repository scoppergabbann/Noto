"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function DonutChart({
  data,
  formatValue,
  innerRadius = 58,
}: {
  data: { name: string; value: number; color: string }[];
  formatValue?: (v: number) => string;
  innerRadius?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={innerRadius} outerRadius="100%" paddingAngle={2} stroke="none">
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,.12)", fontSize: 13 }}
          formatter={(v: number, n) => [formatValue ? formatValue(v) : `${v}`, n]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
