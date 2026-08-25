"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { DailyPoint } from "@/lib/dashboard-data";

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function GrowthChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
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
        <Bar dataKey="joined" fill="#3629b7" radius={[3, 3, 0, 0]} maxBarSize={10} />
        <Bar dataKey="left" fill="#ff4267" radius={[3, 3, 0, 0]} maxBarSize={10} />
        <Line
          type="monotone"
          dataKey="net"
          stroke="#1573ff"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
