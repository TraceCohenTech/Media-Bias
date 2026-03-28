"use client";

import { OUTLET_COLORS } from "@/lib/constants";

interface AuthorStat { author: string; outlet: string; articles: number; avg_sentiment: number; avg_bs_score: number; top_topics: string[] }

function getBSColor(score: number): string { return score >= 30 ? "#dc2626" : score >= 20 ? "#d97706" : score >= 10 ? "#2563eb" : "#059669"; }

export default function AuthorAnalysis({ data }: { data: AuthorStat[] }) {
  if (!data?.length) return null;

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-3 sm:p-6">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#94a3b8] text-xs font-medium border-b border-[#e2e8f0]">
              <th className="text-left pb-3 pr-4">Writer</th>
              <th className="text-left pb-3 pr-4">Outlet</th>
              <th className="text-center pb-3 pr-4">Articles</th>
              <th className="text-center pb-3 pr-4">Avg Sentiment</th>
              <th className="text-center pb-3 pr-4">BS Score</th>
              <th className="text-left pb-3">Topics</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 30).map((author, i) => (
              <tr key={i} className="border-t border-[#f1f5f9] hover:bg-blue-50/30 transition-colors">
                <td className="py-2.5 pr-4 text-[#1a1a2e] text-xs font-semibold max-w-[200px] truncate">{author.author}</td>
                <td className="py-2.5 pr-4"><span className="text-xs font-semibold" style={{ color: OUTLET_COLORS[author.outlet] || "#94a3b8" }}>{author.outlet}</span></td>
                <td className="py-2.5 pr-4 text-center text-[#94a3b8] text-xs">{author.articles}</td>
                <td className="py-2.5 pr-4 text-center">
                  <span className="text-xs font-mono font-semibold" style={{ color: author.avg_sentiment > 0.1 ? "#059669" : author.avg_sentiment < -0.1 ? "#dc2626" : "#2563eb" }}>
                    {author.avg_sentiment > 0 ? "+" : ""}{author.avg_sentiment.toFixed(3)}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ color: getBSColor(author.avg_bs_score), backgroundColor: `${getBSColor(author.avg_bs_score)}10` }}>
                    {author.avg_bs_score}
                  </span>
                </td>
                <td className="py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {author.top_topics.map((t) => <span key={t} className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#f1f5f9] text-[#64748b]">{t}</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {data.slice(0, 20).map((author, i) => (
          <div key={i} className="p-3 rounded-xl bg-white border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#1a1a2e] text-sm font-semibold truncate max-w-[200px]">{author.author}</span>
              <span className="text-xs font-semibold" style={{ color: OUTLET_COLORS[author.outlet] || "#94a3b8" }}>{author.outlet}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#94a3b8]">{author.articles} articles</span>
              <span style={{ color: author.avg_sentiment > 0.1 ? "#059669" : author.avg_sentiment < -0.1 ? "#dc2626" : "#2563eb" }}>
                Sent: {author.avg_sentiment > 0 ? "+" : ""}{author.avg_sentiment.toFixed(3)}
              </span>
              <span style={{ color: getBSColor(author.avg_bs_score) }}>BS: {author.avg_bs_score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
