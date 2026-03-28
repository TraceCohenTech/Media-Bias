"use client";

interface BiasScore {
  outlet: string;
  bias_score: number;
  total_articles: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
}

const OUTLET_COLORS: Record<string, string> = {
  NYT: "#3b82f6",
  WSJ: "#f59e0b",
  Wired: "#ef4444",
  "The Atlantic": "#10b981",
  TechCrunch: "#8b5cf6",
  "The Guardian": "#06b6d4",
};

export default function BiasScores({ data }: { data: BiasScore[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#e6edf3] mb-4 font-mono">
          90-Day Bias Score
        </h2>
        <p className="text-[#7d8590] text-sm">No data yet. Click Refresh to fetch feeds.</p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.bias_score - a.bias_score);
  const maxAbs = Math.max(...sorted.map((d) => Math.abs(d.bias_score)), 0.5);

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[#e6edf3] mb-4 font-mono">
        90-Day Bias Score
      </h2>
      <div className="space-y-4">
        {sorted.map((outlet) => {
          const color = OUTLET_COLORS[outlet.outlet] || "#7d8590";
          const pct = (outlet.bias_score / maxAbs) * 50 + 50;
          const isPositive = outlet.bias_score >= 0;

          return (
            <div key={outlet.outlet}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-sm font-mono font-semibold"
                  style={{ color }}
                >
                  {outlet.outlet}
                </span>
                <span className="text-xs font-mono text-[#7d8590]">
                  {outlet.total_articles} articles
                </span>
              </div>
              <div className="relative h-6 bg-[#161b22] rounded-md overflow-hidden">
                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#30363d]" />
                {/* Bar */}
                <div
                  className="absolute top-0.5 bottom-0.5 rounded-sm transition-all"
                  style={{
                    backgroundColor: color,
                    opacity: 0.7,
                    left: isPositive ? "50%" : `${pct}%`,
                    width: `${Math.abs(pct - 50)}%`,
                  }}
                />
                {/* Score label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-mono font-bold text-[#e6edf3] drop-shadow-sm">
                    {outlet.bias_score > 0 ? "+" : ""}
                    {outlet.bias_score.toFixed(3)}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 mt-1 text-xs font-mono text-[#7d8590]">
                <span className="text-[#22c55e]">
                  +{outlet.positive_count}
                </span>
                <span className="text-[#3b82f6]">
                  ~{outlet.neutral_count}
                </span>
                <span className="text-[#ef4444]">
                  -{outlet.negative_count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-4 text-xs font-mono text-[#7d8590]">
        <span>Negative</span>
        <span>Neutral</span>
        <span>Positive</span>
      </div>
    </div>
  );
}
