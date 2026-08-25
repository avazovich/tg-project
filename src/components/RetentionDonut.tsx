"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function RetentionDonut({ pct }: { pct: number | null }) {
  const value = pct ?? 0;
  const data = [
    { name: "retained", value },
    { name: "rest", value: 100 - value },
  ];
  const color = pct === null ? "#e7e7e7" : pct >= 70 ? "#55a55e" : pct >= 40 ? "#e6a23c" : "#ff4267";

  return (
    <div className="relative w-[120px] h-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={40}
            outerRadius={56}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#f2eeee" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-[#11263c]">
          {pct === null ? "—" : `${pct.toFixed(0)}%`}
        </span>
      </div>
    </div>
  );
}
