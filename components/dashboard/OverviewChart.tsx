"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Feb", total: Math.floor(Math.random() * 5000) + 2000 },
  { name: "Mar", total: Math.floor(Math.random() * 5000) + 2500 },
  { name: "Apr", total: Math.floor(Math.random() * 5000) + 3000 },
  { name: "May", total: Math.floor(Math.random() * 5000) + 4000 },
  { name: "Jun", total: Math.floor(Math.random() * 5000) + 5000 },
  { name: "Jul", total: Math.floor(Math.random() * 5000) + 6000 },
];

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, "Collection"]}
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
