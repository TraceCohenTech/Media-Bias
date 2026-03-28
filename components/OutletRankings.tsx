"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { OUTLET_COLORS } from "@/lib/constants";

interface BiasScore { outlet: string; bias_score: number; avg_bs_score?: number; total_articles: number; positive_count: number; negative_count: number; neutral_count: number; }

export default function OutletRankings({ data }: { data: BiasScore[] }) {
  if (!data?.length) return null;

  const sentimentData = [...data].sort((a, b) => b.bias_score - a.bias_score);
  const bsData = [...data].sort((a, b) => (b.avg_bs_score || 0) - (a.avg_bs_score || 0));

  const tooltipStyle = { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#1a1a2e", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-3 sm:p-6">
        <h3 className="text-sm font-semibold text-[#1a1a2e] mb-1">Sentiment Lean</h3>
        <p className="text-xs text-[#94a3b8] mb-4">Average sentiment across all tech coverage per outlet</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sentimentData} layout="vertical" margin={{ left: 75, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" domain={[-0.15, 0.15]} stroke="#94a3b8" fontSize={10} tickFormatter={(v) => (v > 0 ? `+${v}` : `${v}`)} />
            <YAxis type="category" dataKey="outlet" stroke="#94a3b8" fontSize={11} width={75} />
            <ReferenceLine x={0} stroke="#e2e8f0" />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(3)}`, "Sentiment"]} />
            <Bar dataKey="bias_score" radius={[0, 4, 4, 0]}>
              {sentimentData.map((entry) => (
                <Cell key={entry.outlet} fill={entry.bias_score > 0.02 ? "#22c55e" : entry.bias_score < -0.02 ? "#ef4444" : "#3b82f6"} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-3 sm:p-6">
        <h3 className="text-sm font-semibold text-[#1a1a2e] mb-1">Sensationalism Index</h3>
        <p className="text-xs text-[#94a3b8] mb-4">Average BS score per outlet</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={bsData} layout="vertical" margin={{ left: 75, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" domain={[0, 20]} stroke="#94a3b8" fontSize={10} />
            <YAxis type="category" dataKey="outlet" stroke="#94a3b8" fontSize={11} width={75} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${value}`, "BS Score"]} />
            <Bar dataKey="avg_bs_score" radius={[0, 4, 4, 0]}>
              {bsData.map((entry) => (
                <Cell key={entry.outlet} fill={OUTLET_COLORS[entry.outlet] || "#94a3b8"} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Article mix */}
        <div className="mt-5 space-y-1.5">
          <h4 className="text-xs font-semibold text-[#64748b]">Article Sentiment Mix</h4>
          {data.sort((a, b) => b.total_articles - a.total_articles).slice(0, 10).map((o) => {
            const t = o.total_articles || 1;
            return (
              <div key={o.outlet} className="flex items-center gap-2">
                <span className="text-xs text-[#1a1a2e] font-medium w-24 truncate">{o.outlet}</span>
                <div className="flex-1 h-5 rounded-md overflow-hidden flex bg-[#f1f5f9]">
                  {o.positive_count > 0 && <div style={{ width: `${(o.positive_count / t) * 100}%`, backgroundColor: "#22c55e" }} />}
                  {o.neutral_count > 0 && <div style={{ width: `${(o.neutral_count / t) * 100}%`, backgroundColor: "#e2e8f0" }} />}
                  {o.negative_count > 0 && <div style={{ width: `${(o.negative_count / t) * 100}%`, backgroundColor: "#ef4444" }} />}
                </div>
                <span className="text-[10px] font-mono text-[#94a3b8] w-7 text-right">{t}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
