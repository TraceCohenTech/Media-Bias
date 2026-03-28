"use client";

import { OUTLET_COLORS } from "@/lib/constants";

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

  // Compute distribution summary
  const total = allArticles?.length || 0;
  const clean = allArticles?.filter((a) => a.bs_score < 10).length || 0;
  const low = allArticles?.filter((a) => a.bs_score >= 10 && a.bs_score < 20).length || 0;
  const moderate = allArticles?.filter((a) => a.bs_score >= 20 && a.bs_score < 30).length || 0;
  const high = allArticles?.filter((a) => a.bs_score >= 30).length || 0;

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
      {/* Distribution summary — visual gauges */}
      {total > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
            {[
              { label: "Clean", sublabel: "Score 0-9", count: clean, color: "#22c55e" },
              { label: "Low", sublabel: "Score 10-19", count: low, color: "#3b82f6" },
              { label: "Moderate", sublabel: "Score 20-29", count: moderate, color: "#f59e0b" },
              { label: "High", sublabel: "Score 30+", count: high, color: "#ef4444" },
            ].map((bucket) => (
              <div
                key={bucket.label}
                className="rounded-lg border p-3 text-center"
                style={{ borderColor: `${bucket.color}30` }}
              >
                <div
                  className="text-2xl sm:text-3xl font-bold font-mono"
                  style={{ color: bucket.color }}
                >
                  {bucket.count}
                </div>
                <div className="text-xs font-mono font-semibold" style={{ color: bucket.color }}>
                  {bucket.label}
                </div>
                <div className="text-[10px] font-mono text-[#7d8590]">
                  {bucket.sublabel}
                </div>
              </div>
            ))}
          </div>
          {/* Full-width stacked bar */}
          <div className="flex h-3 rounded-full overflow-hidden">
            {clean > 0 && (
              <div style={{ width: `${(clean / total) * 100}%`, backgroundColor: "#22c55e" }} />
            )}
            {low > 0 && (
              <div style={{ width: `${(low / total) * 100}%`, backgroundColor: "#3b82f6" }} />
            )}
            {moderate > 0 && (
              <div style={{ width: `${(moderate / total) * 100}%`, backgroundColor: "#f59e0b" }} />
            )}
            {high > 0 && (
              <div style={{ width: `${(high / total) * 100}%`, backgroundColor: "#ef4444" }} />
            )}
          </div>
          <div className="text-[10px] font-mono text-[#7d8590] mt-1.5 text-center">
            {Math.round((clean / total) * 100)}% of articles have minimal sensationalism
          </div>
        </div>
      )}

      {/* Top flagged articles */}
      <h3 className="text-sm font-semibold text-[#e6edf3] mb-3 font-mono">
        Most Sensationalized Headlines
      </h3>
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
