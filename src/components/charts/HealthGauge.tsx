"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function HealthGauge({ score }: { score: number }) {
  const color = score >= 70 ? "#0f9d6b" : score >= 45 ? "#f59425" : "#d83a3a";
  const data = [
    { value: score, color },
    { value: 100 - score, color: "currentColor" },
  ];
  return (
    <div className="relative h-[128px] w-[128px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={46}
            outerRadius={60}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            cornerRadius={8}
          >
            <Cell fill={color} />
            <Cell className="text-surface-sunken dark:text-night-border" fill="currentColor" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-heading font-serif text-[34px] font-semibold tabular-nums leading-none">
            {score}
          </div>
          <div className="text-subtle mt-0.5 text-[11px] font-semibold">/ 100</div>
        </div>
      </div>
    </div>
  );
}
