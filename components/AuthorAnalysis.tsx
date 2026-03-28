"use client";

const OUTLET_COLORS: Record<string, string> = {
  NYT: "#3b82f6",
  WSJ: "#f59e0b",
  Wired: "#ef4444",
  "The Atlantic": "#10b981",
  TechCrunch: "#8b5cf6",
  "The Guardian": "#06b6d4",
};

interface AuthorStat {
  author: string;
  outlet: string;
  articles: number;
  avg_sentiment: number;
  avg_bs_score: number;
  top_topics: string[];
}

function getBSColor(score: number): string {
  if (score >= 50) return "#ef4444";
  if (score >= 30) return "#f59e0b";
  if (score >= 15) return "#3b82f6";
  return "#22c55e";
}

export default function AuthorAnalysis({ data }: { data: AuthorStat[] }) {
  if (!data?.length) return null;

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#7d8590] text-xs font-mono">
              <th className="text-left pb-3 pr-4">Writer</th>
              <th className="text-left pb-3 pr-4">Outlet</th>
              <th className="text-center pb-3 pr-4">Articles</th>
              <th className="text-center pb-3 pr-4">Avg Sentiment</th>
              <th className="text-center pb-3 pr-4">BS Score</th>
              <th className="text-left pb-3">Topics</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 30).map((author, i) => {
              const outletColor = OUTLET_COLORS[author.outlet] || "#7d8590";
              const bsColor = getBSColor(author.avg_bs_score);
              return (
                <tr
                  key={i}
                  className="border-t border-[#1a2332] hover:bg-[#161b22] transition-colors"
                >
                  <td className="py-2.5 pr-4 text-[#e6edf3] font-mono text-xs font-semibold">
                    {author.author}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: outletColor }}
                    >
                      {author.outlet}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-center text-[#7d8590] text-xs font-mono">
                    {author.articles}
                  </td>
                  <td className="py-2.5 pr-4 text-center">
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{
                        color:
                          author.avg_sentiment > 0.1
                            ? "#22c55e"
                            : author.avg_sentiment < -0.1
                            ? "#ef4444"
                            : "#3b82f6",
                      }}
                    >
                      {author.avg_sentiment > 0 ? "+" : ""}
                      {author.avg_sentiment.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold"
                      style={{ color: bsColor, backgroundColor: `${bsColor}15` }}
                    >
                      {author.avg_bs_score}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {author.top_topics.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1a2332] text-[#7d8590]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {data.slice(0, 20).map((author, i) => {
          const outletColor = OUTLET_COLORS[author.outlet] || "#7d8590";
          const bsColor = getBSColor(author.avg_bs_score);
          return (
            <div
              key={i}
              className="p-3 rounded-lg border border-[#1a2332]"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#e6edf3] font-mono text-xs font-semibold">
                  {author.author}
                </span>
                <span
                  className="text-[10px] font-mono font-semibold"
                  style={{ color: outletColor }}
                >
                  {author.outlet}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="text-[#7d8590]">{author.articles} articles</span>
                <span
                  style={{
                    color:
                      author.avg_sentiment > 0.1
                        ? "#22c55e"
                        : author.avg_sentiment < -0.1
                        ? "#ef4444"
                        : "#3b82f6",
                  }}
                >
                  Sent: {author.avg_sentiment > 0 ? "+" : ""}
                  {author.avg_sentiment.toFixed(3)}
                </span>
                <span style={{ color: bsColor }}>BS: {author.avg_bs_score}</span>
              </div>
              {author.top_topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {author.top_topics.map((t) => (
                    <span
                      key={t}
                      className="px-1 py-0.5 rounded text-[9px] font-mono bg-[#1a2332] text-[#7d8590]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
