"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WordTrendEntry {
  week: string;
  terms: { term: string; count: number }[];
}

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#22c55e", "#06b6d4", "#8b5cf6", "#ec4899", "#f97316"];

export default function WordTrends({ data }: { data: WordTrendEntry[] }) {
  if (!data?.length) return null;

  const globalTerms: Record<string, number> = {};
  for (const week of data) {
    for (const t of week.terms) {
      globalTerms[t.term] = (globalTerms[t.term] || 0) + t.count;
    }
  }
  const topTerms = Object.entries(globalTerms)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([term, count]) => ({ term, count }));

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={topTerms} layout="vertical" margin={{ left: 60, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" horizontal={false} />
          <XAxis type="number" stroke="#7d8590" fontSize={10} />
          <YAxis
            type="category"
            dataKey="term"
            stroke="#7d8590"
            fontSize={10}
            tick={{ fontFamily: "JetBrains Mono, monospace" }}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161b22",
              border: "1px solid #1a2332",
              borderRadius: "8px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
              color: "#e6edf3",
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {topTerms.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} opacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Weekly breakdown */}
      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
        <h3 className="text-xs sm:text-sm font-mono text-[#7d8590] font-semibold">
          Weekly Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {data.slice(-6).reverse().map((week) => (
            <div key={week.week} className="p-2 sm:p-3 rounded-lg border border-[#1a2332]">
              <div className="text-[10px] sm:text-xs font-mono text-[#7d8590] mb-1.5">
                Week of {week.week}
              </div>
              <div className="flex flex-wrap gap-1">
                {week.terms.slice(0, 6).map((t) => (
                  <span
                    key={t.term}
                    className="px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-[#3b82f615] text-[#3b82f6]"
                  >
                    {t.term} ({t.count})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
