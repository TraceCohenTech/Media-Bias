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

  const outletStats: Record<string, { pos: number; neg: number; neu: number; total: number; avgBs: number; bsSum: number }> = {};
  data.forEach((d) => {
    if (!outletStats[d.outlet]) outletStats[d.outlet] = { pos: 0, neg: 0, neu: 0, total: 0, avgBs: 0, bsSum: 0 };
    const s = outletStats[d.outlet];
    s.total++; s.bsSum += d.bs_score;
    if (d.sentiment_score > 0.1) s.pos++;
    else if (d.sentiment_score < -0.1) s.neg++;
    else s.neu++;
  });
  for (const s of Object.values(outletStats)) s.avgBs = Math.round(s.bsSum / s.total);

  const outlets = Object.entries(outletStats).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 sm:p-6">
      <div className="space-y-2.5">
        {outlets.map(([outlet, stats]) => {
          const color = OUTLET_COLORS[outlet] || "#94a3b8";
          const posPct = Math.round((stats.pos / stats.total) * 100);
          const neuPct = Math.round((stats.neu / stats.total) * 100);
          const negPct = Math.round((stats.neg / stats.total) * 100);

          return (
            <div key={outlet} className="p-3 sm:p-4 rounded-xl bg-white border border-[#e2e8f0] hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-sm sm:text-base font-semibold text-[#1a1a2e]">{outlet}</span>
                  <span className="text-xs text-[#94a3b8]">{stats.total} articles</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#94a3b8]">Avg BS </span>
                  <span className="text-sm font-bold font-mono" style={{ color: stats.avgBs >= 20 ? "#d97706" : stats.avgBs >= 10 ? "#2563eb" : "#059669" }}>
                    {stats.avgBs}
                  </span>
                </div>
              </div>
              <div className="flex h-7 sm:h-8 rounded-lg overflow-hidden">
                {posPct > 0 && (
                  <div className="flex items-center justify-center text-xs font-semibold text-white transition-all" style={{ width: `${Math.max(posPct, 3)}%`, backgroundColor: "#22c55e" }}>
                    {posPct > 10 && `${posPct}%`}
                  </div>
                )}
                {neuPct > 0 && (
                  <div className="flex items-center justify-center text-xs font-semibold text-[#64748b] transition-all" style={{ width: `${neuPct}%`, backgroundColor: "#e2e8f0" }}>
                    {neuPct > 12 && `${neuPct}%`}
                  </div>
                )}
                {negPct > 0 && (
                  <div className="flex items-center justify-center text-xs font-semibold text-white transition-all" style={{ width: `${Math.max(negPct, 3)}%`, backgroundColor: "#ef4444" }}>
                    {negPct > 10 && `${negPct}%`}
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-1.5 text-xs">
                <span className="text-emerald-600 font-medium">{stats.pos} positive</span>
                <span className="text-[#94a3b8]">{stats.neu} neutral</span>
                <span className="text-red-600 font-medium">{stats.neg} negative</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
