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
import type { PeriodPoint } from "@/lib/dashboard-data";

function formatTick(iso: string, granularity: "hour" | "day", intlLocale: string) {
  const d = new Date(iso);
  return granularity === "hour"
    ? d.toLocaleTimeString(intlLocale, { hour: "numeric" })
    : d.toLocaleDateString(intlLocale, { month: "short", day: "numeric" });
}

function formatTooltipLabel(iso: string, granularity: "hour" | "day", intlLocale: string) {
  const d = new Date(iso);
  return granularity === "hour"
    ? d.toLocaleTimeString(intlLocale, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString(intlLocale, { weekday: "short", month: "short", day: "numeric" });
}

export default function GrowthChart({
  data,
  granularity = "day",
  intlLocale = "en-US",
}: {
  data: PeriodPoint[];
  granularity?: "hour" | "day";
  intlLocale?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f2eeee" vertical={false} />
        <XAxis
          dataKey="bucketStart"
          tickFormatter={(v) => formatTick(String(v), granularity, intlLocale)}
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
          labelFormatter={(v) => formatTooltipLabel(String(v), granularity, intlLocale)}
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
