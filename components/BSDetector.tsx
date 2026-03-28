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
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-lg font-semibold text-[#e6edf3] font-mono">
          BS Detector
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#ef444420] text-[#ef4444] font-mono">
          Top {data.length} flagged
        </span>
      </div>
      <p className="text-[#7d8590] text-xs mb-5 font-mono">
        Scored by charged language density, sentiment extremity, and clickbait patterns (0-100)
      </p>

      <div className="space-y-2">
        {data.map((article, i) => {
          const color = getBSColor(article.bs_score);
          const label = getBSLabel(article.bs_score);

          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg border border-[#1a2332] hover:border-[#30363d] transition-colors"
            >
              {/* BS Score badge */}
              <div className="flex-shrink-0 w-16 text-center">
                <div
                  className="text-lg font-bold font-mono"
                  style={{ color }}
                >
                  {article.bs_score}
                </div>
                <div
                  className="text-[9px] font-mono font-semibold tracking-wider"
                  style={{ color }}
                >
                  {label}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-[#e6edf3] text-sm font-mono leading-snug">
                  {article.headline}
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[#7d8590] text-xs font-mono">
                    {article.outlet}
                  </span>
                  {article.author && (
                    <span className="text-[#7d8590] text-xs font-mono">
                      {article.author}
                    </span>
                  )}
                  <span className="text-[#7d8590] text-xs font-mono">
                    {article.date}
                  </span>
                </div>
                {article.flagged_terms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {article.flagged_terms.map((term) => (
                      <span
                        key={term}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sentiment */}
              <div className="flex-shrink-0 text-right">
                <span
                  className="text-xs font-mono font-semibold"
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
