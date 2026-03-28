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
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[#e6edf3] mb-1 font-mono">
        Writer Analysis
      </h2>
      <p className="text-[#7d8590] text-xs mb-5 font-mono">
        Sentiment and BS scores by individual writer (2+ articles)
      </p>

      <div className="overflow-x-auto">
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
    </div>
  );
}
