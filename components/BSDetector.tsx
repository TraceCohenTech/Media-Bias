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

const OUTLET_COLORS: Record<string, string> = {
  NYT: "#3b82f6",
  WSJ: "#f59e0b",
  Wired: "#ef4444",
  "The Atlantic": "#10b981",
  TechCrunch: "#8b5cf6",
  "The Guardian": "#06b6d4",
};

interface BSArticle {
  outlet: string;
  date: string;
  headline: string;
  author: string;
  bs_score: number;
  sentiment_score: number;
  flagged_terms: string[];
}

interface AllArticle {
  outlet: string;
  bs_score: number;
}

function getBSColor(score: number): string {
  if (score >= 30) return "#ef4444";
  if (score >= 20) return "#f59e0b";
  if (score >= 10) return "#3b82f6";
  return "#22c55e";
}

function getBSLabel(score: number): string {
  if (score >= 30) return "HIGH";
  if (score >= 20) return "MODERATE";
  if (score >= 10) return "LOW";
  return "CLEAN";
}

export default function BSDetector({
  data,
  allArticles,
}: {
  data: BSArticle[];
  allArticles?: AllArticle[];
}) {
  if (!data?.length) return null;

  // Build histogram from all articles
  const buckets = [
    { label: "0-4", min: 0, max: 4 },
    { label: "5-9", min: 5, max: 9 },
    { label: "10-14", min: 10, max: 14 },
    { label: "15-19", min: 15, max: 19 },
    { label: "20-24", min: 20, max: 24 },
    { label: "25-29", min: 25, max: 29 },
    { label: "30+", min: 30, max: 100 },
  ];

  const histData = buckets.map((b) => {
    const count = (allArticles || []).filter(
      (a) => a.bs_score >= b.min && a.bs_score <= b.max
    ).length;
    return { ...b, count };
  });

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
      {/* Histogram */}
      {allArticles && allArticles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#e6edf3] mb-1 font-mono">
            BS Score Distribution
          </h3>
          <p className="text-[10px] sm:text-xs text-[#7d8590] font-mono mb-3">
            How articles distribute across sensationalism levels
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={histData} margin={{ left: -10, right: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#7d8590"
                fontSize={10}
                tick={{ fontFamily: "JetBrains Mono" }}
              />
              <YAxis stroke="#7d8590" fontSize={10} width={30} />
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
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {histData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={
                      entry.min >= 30
                        ? "#ef4444"
                        : entry.min >= 20
                        ? "#f59e0b"
                        : entry.min >= 10
                        ? "#3b82f6"
                        : "#22c55e"
                    }
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top articles */}
      <h3 className="text-sm font-semibold text-[#e6edf3] mb-1 font-mono">
        Most Sensationalized Headlines
      </h3>
      <p className="text-[10px] sm:text-xs text-[#7d8590] font-mono mb-3">
        Ranked by charged language, sentiment extremity, and clickbait signals
      </p>
      <div className="space-y-2">
        {data.slice(0, 15).map((article, i) => {
          const color = getBSColor(article.bs_score);
          const label = getBSLabel(article.bs_score);

          return (
            <div
              key={i}
              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-[#1a2332] hover:border-[#30363d] transition-colors"
            >
              <div className="flex-shrink-0 w-12 sm:w-14 text-center">
                <div
                  className="text-base sm:text-lg font-bold font-mono"
                  style={{ color }}
                >
                  {article.bs_score}
                </div>
                <div
                  className="text-[8px] font-mono font-semibold tracking-wider"
                  style={{ color }}
                >
                  {label}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[#e6edf3] text-xs sm:text-sm font-mono leading-snug">
                  {article.headline}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                  <span
                    className="text-[10px] font-mono font-semibold"
                    style={{
                      color: OUTLET_COLORS[article.outlet] || "#7d8590",
                    }}
                  >
                    {article.outlet}
                  </span>
                  <span className="text-[#7d8590] text-[10px] font-mono">
                    {article.date}
                  </span>
                  {article.author && (
                    <span className="text-[#7d8590] text-[10px] font-mono hidden sm:inline">
                      {article.author}
                    </span>
                  )}
                </div>
                {article.flagged_terms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {article.flagged_terms.map((term) => (
                      <span
                        key={term}
                        className="px-1 sm:px-1.5 py-0.5 rounded text-[9px] font-mono"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
