"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
  formatValue?: (v: number) => string;
}

function DonutTooltip({ active, payload, formatValue }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-black/[.06] bg-white/95 px-3 py-2 shadow-softlg backdrop-blur dark:border-white/10 dark:bg-night-raised2/95">
      <div className="flex items-center gap-2 text-[12.5px]">
        <span className="h-2 w-2 rounded-full" style={{ background: p.payload.color }} />
        <span className="text-muted font-medium">{p.name}</span>
        <span className="text-heading ml-auto font-semibold tabular-nums">
          {formatValue ? formatValue(p.value) : p.value}
        </span>
      </div>
    </div>
  );
}

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
        <Pie
          data={data}
          dataKey="value"
          innerRadius={innerRadius}
          outerRadius="100%"
          paddingAngle={3}
          stroke="none"
          cornerRadius={5}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip content={<DonutTooltip formatValue={formatValue} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
