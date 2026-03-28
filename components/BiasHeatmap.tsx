"use client";

interface HeatmapData {
  [outlet: string]: { [topic: string]: { score: number; count: number } };
}

const TOPICS = ["AI / ML", "startups / founders", "VC / funding", "big tech", "CEO / billionaire", "regulation / antitrust", "cybersecurity", "crypto / web3"];
const SHORT_TOPICS: Record<string, string> = {
  "AI / ML": "AI", "startups / founders": "Startups", "VC / funding": "VC",
  "big tech": "Big Tech", "CEO / billionaire": "CEOs", "regulation / antitrust": "Regulation",
  "cybersecurity": "Security", "crypto / web3": "Crypto",
};

function getColor(score: number): string {
  if (score > 0.15) return "#059669";
  if (score > 0.05) return "#10b981";
  if (score > -0.05) return "#2563eb";
  if (score > -0.15) return "#ea580c";
  return "#dc2626";
}

export default function BiasHeatmap({ data }: { data: HeatmapData }) {
  const outlets = Object.keys(data);
  if (outlets.length === 0) return null;

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-3 sm:p-6">
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <table className="w-full text-sm min-w-[540px]">
          <thead>
            <tr>
              <th className="text-left text-[#94a3b8] font-medium pb-3 pr-2 text-xs">Outlet</th>
              {TOPICS.map((topic) => (
                <th key={topic} className="text-center text-[#94a3b8] font-medium pb-3 px-1 text-[10px] sm:text-xs">
                  <span className="hidden sm:inline">{SHORT_TOPICS[topic] || topic}</span>
                  <span className="sm:hidden">{SHORT_TOPICS[topic] || topic}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {outlets.map((outlet) => (
              <tr key={outlet} className="border-t border-[#f1f5f9]">
                <td className="text-[#1a1a2e] font-medium py-2.5 pr-2 whitespace-nowrap text-xs sm:text-sm">{outlet}</td>
                {TOPICS.map((topic) => {
                  const cell = data[outlet]?.[topic];
                  if (!cell) return <td key={topic} className="text-center py-2.5 px-1"><span className="text-[#e2e8f0] text-xs">{"\u2014"}</span></td>;
                  const color = getColor(cell.score);
                  return (
                    <td key={topic} className="text-center py-2.5 px-1">
                      <div className="inline-block rounded-lg px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs font-mono font-semibold" style={{ color, backgroundColor: `${color}10` }} title={`${cell.count} articles`}>
                        {cell.score > 0 ? "+" : ""}{cell.score.toFixed(2)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-[#94a3b8]">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" /> Negative</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Neutral</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> Positive</span>
      </div>
    </div>
  );
}
