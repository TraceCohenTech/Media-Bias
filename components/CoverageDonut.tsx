"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { OUTLET_COLORS } from "@/lib/constants";

interface BiasScore {
  outlet: string;
  total_articles: number;
}

export default function CoverageDonut({ data, total }: { data: BiasScore[]; total: number }) {
  if (!data?.length) return null;
  const sorted = [...data].sort((a, b) => b.total_articles - a.total_articles);

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 flex items-center gap-4">
      <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={sorted} dataKey="total_articles" nameKey="outlet" cx="50%" cy="50%" innerRadius="58%" outerRadius="90%" strokeWidth={2} stroke="#ffffff">
              {sorted.map((entry) => (
                <Cell key={entry.outlet} fill={OUTLET_COLORS[entry.outlet] || "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#1a1a2e", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              formatter={(value: any, name: any) => [`${value} (${((Number(value) / total) * 100).toFixed(0)}%)`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-[#1a1a2e] font-mono">{total.toLocaleString()}</div>
            <div className="text-[9px] sm:text-[10px] text-[#94a3b8]">articles</div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-1">
        {sorted.slice(0, 10).map((entry) => (
          <div key={entry.outlet} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: OUTLET_COLORS[entry.outlet] || "#94a3b8" }} />
              <span className="text-xs sm:text-sm text-[#1a1a2e] font-medium">{entry.outlet}</span>
            </div>
            <span className="text-xs sm:text-sm font-mono text-[#94a3b8]">
              {entry.total_articles} <span className="text-[#cbd5e1]">({((entry.total_articles / total) * 100).toFixed(0)}%)</span>
            </span>
          </div>
        ))}
        {sorted.length > 10 && (
          <div className="text-xs text-[#94a3b8]">+{sorted.length - 10} more outlets</div>
        )}
      </div>
    </div>
  );
}
