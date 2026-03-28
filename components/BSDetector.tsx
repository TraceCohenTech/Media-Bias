"use client";

interface BSArticle {
  outlet: string;
  date: string;
  headline: string;
  author: string;
  bs_score: number;
  sentiment_score: number;
  flagged_terms: string[];
}

function getBSColor(score: number): string {
  if (score >= 60) return "#ef4444";
  if (score >= 40) return "#f59e0b";
  if (score >= 20) return "#3b82f6";
  return "#22c55e";
}

function getBSLabel(score: number): string {
  if (score >= 60) return "HIGH BS";
  if (score >= 40) return "MODERATE";
  if (score >= 20) return "LOW";
  return "CLEAN";
}

export default function BSDetector({ data }: { data: BSArticle[] }) {
  if (!data?.length) return null;

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
      <div className="space-y-2">
        {data.map((article, i) => {
          const color = getBSColor(article.bs_score);
          const label = getBSLabel(article.bs_score);

          return (
            <div
              key={i}
              className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-[#1a2332] hover:border-[#30363d] transition-colors"
            >
              <div className="flex-shrink-0 w-12 sm:w-16 text-center">
                <div
                  className="text-base sm:text-lg font-bold font-mono"
                  style={{ color }}
                >
                  {article.bs_score}
                </div>
                <div
                  className="text-[8px] sm:text-[9px] font-mono font-semibold tracking-wider"
                  style={{ color }}
                >
                  {label}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[#e6edf3] text-xs sm:text-sm font-mono leading-snug">
                  {article.headline}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-1">
                  <span className="text-[#7d8590] text-[10px] sm:text-xs font-mono">
                    {article.outlet}
                  </span>
                  {article.author && (
                    <span className="text-[#7d8590] text-[10px] sm:text-xs font-mono hidden sm:inline">
                      {article.author}
                    </span>
                  )}
                  <span className="text-[#7d8590] text-[10px] sm:text-xs font-mono">
                    {article.date}
                  </span>
                </div>
                {article.flagged_terms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {article.flagged_terms.map((term) => (
                      <span
                        key={term}
                        className="px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <span
                  className="text-[10px] sm:text-xs font-mono font-semibold"
                  style={{
                    color:
                      article.sentiment_score > 0.1
                        ? "#22c55e"
                        : article.sentiment_score < -0.1
                        ? "#ef4444"
                        : "#3b82f6",
                  }}
                >
                  {article.sentiment_score > 0 ? "+" : ""}
                  {article.sentiment_score.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
