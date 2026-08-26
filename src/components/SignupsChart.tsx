"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function formatDay(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function SignupsChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f2eeee" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          stroke="#8e8f8f"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          stroke="#8e8f8f"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={32}
          allowDecimals={false}
        />
        <Tooltip
          labelFormatter={(v) => formatDay(String(v))}
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #f2eeee",
            borderRadius: 12,
            fontSize: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          }}
          labelStyle={{ color: "#494949" }}
        />
        <Bar dataKey="count" fill="#3629b7" radius={[3, 3, 0, 0]} maxBarSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}
