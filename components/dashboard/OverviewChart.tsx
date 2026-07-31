"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type ChartItem = {
  name: string;
  total: number;
};

export function OverviewChart({ data = [] }: { data?: ChartItem[] }) {
  const chartData = data.length > 0 ? data : [
    { name: "No Data", total: 0 }
  ];

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: "#94a3b8" }}
          dy={4}
        />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "11px" }}
          formatter={(value: unknown) => [`Rs. ${Number(value || 0).toLocaleString()}`, "Collection"]}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#4f46e5"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorTotal)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
