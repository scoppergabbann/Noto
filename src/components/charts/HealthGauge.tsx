"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function HealthGauge({ score }: { score: number }) {
  const data = [
    { value: score, color: "#1f9e6f" },
    { value: 100 - score, color: "rgba(128,128,140,.14)" },
  ];
  return (
    <div className="relative h-[120px] w-[120px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={42}
            outerRadius={56}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="serif text-[30px] font-semibold leading-none">{score}</div>
          <div className="text-[11px] text-ink-faint">/ 100</div>
        </div>
      </div>
    </div>
  );
}
