"use client";

import { OUTLET_COLORS } from "@/lib/constants";

interface Article {
  outlet: string;
  headline: string;
  sentiment_score: number;
  bs_score: number;
}

export default function SentimentScatter({ data }: { data: Article[] }) {
  if (!data?.length) return null;

  // Group by outlet and compute stats
  const outletStats: Record<
    string,
    { pos: number; neg: number; neu: number; total: number; avgBs: number; bsSum: number }
  > = {};
  data.forEach((d) => {
    if (!outletStats[d.outlet])
      outletStats[d.outlet] = { pos: 0, neg: 0, neu: 0, total: 0, avgBs: 0, bsSum: 0 };
    const s = outletStats[d.outlet];
    s.total++;
    s.bsSum += d.bs_score;
    if (d.sentiment_score > 0.1) s.pos++;
    else if (d.sentiment_score < -0.1) s.neg++;
    else s.neu++;
  });
  for (const s of Object.values(outletStats)) {
    s.avgBs = Math.round(s.bsSum / s.total);
  }

  const outlets = Object.entries(outletStats).sort(
    (a, b) => b[1].total - a[1].total
  );

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
      <div className="space-y-3">
        {outlets.map(([outlet, stats]) => {
          const color = OUTLET_COLORS[outlet] || "#7d8590";
          const posPct = Math.round((stats.pos / stats.total) * 100);
          const neuPct = Math.round((stats.neu / stats.total) * 100);
          const negPct = Math.round((stats.neg / stats.total) * 100);

          return (
            <div key={outlet} className="p-3 sm:p-4 rounded-lg border border-[#1a2332]">
              {/* Outlet header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm sm:text-base font-mono font-semibold text-[#e6edf3]">
                    {outlet}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono text-[#7d8590]">
                    {stats.total} articles
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-[#7d8590]">Avg BS</div>
                    <div
                      className="text-sm font-mono font-bold"
                      style={{
                        color:
                          stats.avgBs >= 20
                            ? "#f59e0b"
                            : stats.avgBs >= 10
                            ? "#3b82f6"
                            : "#22c55e",
                      }}
                    >
                      {stats.avgBs}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sentiment bar */}
              <div className="flex h-6 sm:h-7 rounded-md overflow-hidden mb-1.5">
                {posPct > 0 && (
                  <div
                    className="flex items-center justify-center text-[10px] sm:text-xs font-mono font-semibold text-[#080b12] transition-all"
                    style={{
                      width: `${posPct}%`,
                      backgroundColor: "#22c55e",
                      minWidth: posPct > 3 ? undefined : "20px",
                    }}
                  >
                    {posPct > 8 && `${posPct}%`}
                  </div>
                )}
                {neuPct > 0 && (
                  <div
                    className="flex items-center justify-center text-[10px] sm:text-xs font-mono font-semibold text-[#e6edf3] transition-all"
                    style={{
                      width: `${neuPct}%`,
                      backgroundColor: "#1e3a5f",
                    }}
                  >
                    {neuPct > 8 && `${neuPct}%`}
                  </div>
                )}
                {negPct > 0 && (
                  <div
                    className="flex items-center justify-center text-[10px] sm:text-xs font-mono font-semibold text-[#080b12] transition-all"
                    style={{
                      width: `${negPct}%`,
                      backgroundColor: "#ef4444",
                      minWidth: negPct > 3 ? undefined : "20px",
                    }}
                  >
                    {negPct > 8 && `${negPct}%`}
                  </div>
                )}
              </div>

              {/* Legend counts */}
              <div className="flex gap-3 text-[10px] sm:text-xs font-mono">
                <span className="text-[#22c55e]">
                  {stats.pos} positive
                </span>
                <span className="text-[#7d8590]">
                  {stats.neu} neutral
                </span>
                <span className="text-[#ef4444]">
                  {stats.neg} negative
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
