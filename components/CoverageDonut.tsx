"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { OUTLET_COLORS } from "@/lib/constants";


interface BiasScore {
  outlet: string;
  total_articles: number;
}

export default function CoverageDonut({
  data,
  total,
}: {
  data: BiasScore[];
  total: number;
}) {
  if (!data?.length) return null;

  const sorted = [...data].sort((a, b) => b.total_articles - a.total_articles);

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-4 flex items-center gap-3">
      <div className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sorted}
              dataKey="total_articles"
              nameKey="outlet"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              strokeWidth={0}
            >
              {sorted.map((entry) => (
                <Cell
                  key={entry.outlet}
                  fill={OUTLET_COLORS[entry.outlet] || "#666"}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b22",
                border: "1px solid #1a2332",
                borderRadius: "6px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                color: "#e6edf3",
              }}
              formatter={(value: any, name: any) => [
                `${value} (${((Number(value) / total) * 100).toFixed(0)}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-[#e6edf3] font-mono">
              {total}
            </div>
            <div className="text-[8px] sm:text-[9px] text-[#7d8590] font-mono">
              articles
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-1">
        {sorted.map((entry) => (
          <div key={entry.outlet} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: OUTLET_COLORS[entry.outlet] || "#666",
                }}
              />
              <span className="text-[10px] sm:text-xs font-mono text-[#e6edf3]">
                {entry.outlet}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-[#7d8590]">
              {entry.total_articles}{" "}
              <span className="text-[#30363d]">
                ({((entry.total_articles / total) * 100).toFixed(0)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
