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
  ReferenceLine,
} from "recharts";
import { OUTLET_COLORS } from "@/lib/constants";


interface BiasScore {
  outlet: string;
  bias_score: number;
  avg_bs_score?: number;
  total_articles: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
}

export default function OutletRankings({ data }: { data: BiasScore[] }) {
  if (!data?.length) return null;

  const sentimentData = [...data].sort((a, b) => b.bias_score - a.bias_score);
  const bsData = [...data].sort(
    (a, b) => (b.avg_bs_score || 0) - (a.avg_bs_score || 0)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sentiment Lean */}
      <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
        <h3 className="text-sm font-semibold text-[#e6edf3] mb-1 font-mono">
          Sentiment Lean
        </h3>
        <p className="text-[10px] sm:text-xs text-[#7d8590] font-mono mb-4">
          Average sentiment across all tech coverage — positive means more favorable framing
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={sentimentData}
            layout="vertical"
            margin={{ left: 70, right: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1a2332"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[-0.15, 0.15]}
              stroke="#7d8590"
              fontSize={10}
              tickFormatter={(v) => (v > 0 ? `+${v}` : `${v}`)}
            />
            <YAxis
              type="category"
              dataKey="outlet"
              stroke="#7d8590"
              fontSize={11}
              tick={{ fontFamily: "JetBrains Mono, monospace" }}
              width={70}
            />
            <ReferenceLine x={0} stroke="#30363d" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b22",
                border: "1px solid #1a2332",
                borderRadius: "8px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                color: "#e6edf3",
              }}
              formatter={(value: any) => [
                `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(3)}`,
                "Sentiment",
              ]}
            />
            <Bar dataKey="bias_score" radius={[0, 4, 4, 0]}>
              {sentimentData.map((entry) => (
                <Cell
                  key={entry.outlet}
                  fill={
                    entry.bias_score > 0.02
                      ? "#22c55e"
                      : entry.bias_score < -0.02
                      ? "#ef4444"
                      : "#3b82f6"
                  }
                  fillOpacity={0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sensationalism Index */}
      <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
        <h3 className="text-sm font-semibold text-[#e6edf3] mb-1 font-mono">
          Sensationalism Index
        </h3>
        <p className="text-[10px] sm:text-xs text-[#7d8590] font-mono mb-4">
          Average BS score per outlet — higher = more charged language and clickbait
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={bsData}
            layout="vertical"
            margin={{ left: 70, right: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1a2332"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 30]}
              stroke="#7d8590"
              fontSize={10}
            />
            <YAxis
              type="category"
              dataKey="outlet"
              stroke="#7d8590"
              fontSize={11}
              tick={{ fontFamily: "JetBrains Mono, monospace" }}
              width={70}
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
              formatter={(value: any) => [`${value}`, "BS Score"]}
            />
            <Bar dataKey="avg_bs_score" radius={[0, 4, 4, 0]}>
              {bsData.map((entry) => (
                <Cell
                  key={entry.outlet}
                  fill={OUTLET_COLORS[entry.outlet] || "#666"}
                  fillOpacity={0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Article mix bars */}
        <div className="mt-4 space-y-2">
          <h4 className="text-[10px] sm:text-xs font-mono text-[#7d8590] font-semibold">
            Article Sentiment Mix
          </h4>
          {data
            .sort((a, b) => b.total_articles - a.total_articles)
            .map((outlet) => {
              const total = outlet.total_articles || 1;
              const posW = (outlet.positive_count / total) * 100;
              const neuW = (outlet.neutral_count / total) * 100;
              const negW = (outlet.negative_count / total) * 100;
              return (
                <div key={outlet.outlet} className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-mono text-[#e6edf3] w-20 sm:w-24 truncate">
                    {outlet.outlet}
                  </span>
                  <div className="flex-1 h-4 sm:h-5 rounded-md overflow-hidden flex">
                    <div
                      className="h-full"
                      style={{
                        width: `${posW}%`,
                        backgroundColor: "#22c55e",
                        opacity: 0.7,
                      }}
                    />
                    <div
                      className="h-full"
                      style={{
                        width: `${neuW}%`,
                        backgroundColor: "#3b82f6",
                        opacity: 0.4,
                      }}
                    />
                    <div
                      className="h-full"
                      style={{
                        width: `${negW}%`,
                        backgroundColor: "#ef4444",
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono text-[#7d8590] w-8 text-right">
                    {total}
                  </span>
                </div>
              );
            })}
          <div className="flex gap-3 mt-1 text-[9px] sm:text-[10px] font-mono text-[#7d8590]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#22c55e]" /> Positive
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#3b82f6] opacity-60" />{" "}
              Neutral
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#ef4444]" /> Negative
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
