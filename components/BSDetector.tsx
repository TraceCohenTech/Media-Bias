"use client";

import { OUTLET_COLORS } from "@/lib/constants";

interface BSArticle { outlet: string; date: string; headline: string; author: string; bs_score: number; sentiment_score: number; flagged_terms: string[]; }
interface AllArticle { outlet: string; bs_score: number; }

function getBSColor(score: number): string { return score >= 30 ? "#dc2626" : score >= 20 ? "#d97706" : score >= 10 ? "#2563eb" : "#059669"; }
function getBSLabel(score: number): string { return score >= 30 ? "HIGH" : score >= 20 ? "MODERATE" : score >= 10 ? "LOW" : "CLEAN"; }

export default function BSDetector({ data, allArticles }: { data: BSArticle[]; allArticles?: AllArticle[] }) {
  if (!data?.length) return null;

  const total = allArticles?.length || 0;
  const clean = allArticles?.filter((a) => a.bs_score < 10).length || 0;
  const low = allArticles?.filter((a) => a.bs_score >= 10 && a.bs_score < 20).length || 0;
  const moderate = allArticles?.filter((a) => a.bs_score >= 20 && a.bs_score < 30).length || 0;
  const high = allArticles?.filter((a) => a.bs_score >= 30).length || 0;

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 sm:p-6">
      {total > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Clean", sub: "Score 0\u20139", count: clean, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
              { label: "Low", sub: "Score 10\u201319", count: low, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
              { label: "Moderate", sub: "Score 20\u201329", count: moderate, color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
              { label: "High", sub: "Score 30+", count: high, color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
            ].map((b) => (
              <div key={b.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: b.bg, borderColor: b.border, border: `1px solid ${b.border}` }}>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono" style={{ color: b.color }}>{b.count}</div>
                <div className="text-sm font-semibold mt-0.5" style={{ color: b.color }}>{b.label}</div>
                <div className="text-xs text-[#94a3b8] mt-0.5">{b.sub}</div>
              </div>
            ))}
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-[#e2e8f0]">
            {clean > 0 && <div style={{ width: `${(clean / total) * 100}%`, backgroundColor: "#22c55e" }} />}
            {low > 0 && <div style={{ width: `${(low / total) * 100}%`, backgroundColor: "#3b82f6" }} />}
            {moderate > 0 && <div style={{ width: `${(moderate / total) * 100}%`, backgroundColor: "#f59e0b" }} />}
            {high > 0 && <div style={{ width: `${(high / total) * 100}%`, backgroundColor: "#ef4444" }} />}
          </div>
          <div className="text-xs text-[#94a3b8] mt-2 text-center">{Math.round((clean / total) * 100)}% of articles have minimal sensationalism</div>
        </div>
      )}

      <h3 className="text-base font-semibold text-[#1a1a2e] mb-3">Most Sensationalized Headlines</h3>
      <div className="space-y-2">
        {data.slice(0, 15).map((article, i) => {
          const color = getBSColor(article.bs_score);
          return (
            <div key={i} className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-white border border-[#e2e8f0] hover:shadow-sm transition-shadow">
              <div className="flex-shrink-0 w-14 text-center">
                <div className="text-lg font-extrabold font-mono" style={{ color }}>{article.bs_score}</div>
                <div className="text-[9px] font-semibold tracking-wider" style={{ color }}>{getBSLabel(article.bs_score)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#1a1a2e] text-sm leading-snug font-medium">{article.headline}</div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-xs font-semibold" style={{ color: OUTLET_COLORS[article.outlet] || "#94a3b8" }}>{article.outlet}</span>
                  <span className="text-[#94a3b8] text-xs">{article.date}</span>
                </div>
                {article.flagged_terms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.flagged_terms.map((term) => (
                      <span key={term} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${color}10`, color }}>{term}</span>
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
