"use client";

interface HeatmapData {
  [outlet: string]: {
    [topic: string]: { score: number; count: number };
  };
}

const TOPICS = ["AI / ML", "startups / founders", "VC / funding", "big tech", "CEO / billionaire", "regulation / antitrust", "cybersecurity", "crypto / web3"];
const SHORT_TOPICS: Record<string, string> = {
  "AI / ML": "AI",
  "startups / founders": "startups",
  "VC / funding": "VC",
  "big tech": "big tech",
  "CEO / billionaire": "CEOs",
  "regulation / antitrust": "reg",
  "cybersecurity": "sec",
  "crypto / web3": "crypto",
  "climate": "clim",
};

function getColor(score: number): string {
  if (score > 0.3) return "#22c55e";
  if (score > 0.1) return "#4ade80";
  if (score > -0.1) return "#3b82f6";
  if (score > -0.3) return "#f97316";
  return "#ef4444";
}

export default function BiasHeatmap({ data }: { data: HeatmapData }) {
  const outlets = Object.keys(data);
  if (outlets.length === 0) return null;

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr>
              <th className="text-left text-[#7d8590] font-mono font-normal pb-3 pr-2 text-xs">
                Outlet
              </th>
              {TOPICS.map((topic) => (
                <th
                  key={topic}
                  className="text-center text-[#7d8590] font-mono font-normal pb-3 px-1 text-[10px] sm:text-xs"
                >
                  <span className="hidden sm:inline">{topic}</span>
                  <span className="sm:hidden">{SHORT_TOPICS[topic] || topic}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {outlets.map((outlet) => (
              <tr key={outlet} className="border-t border-[#1a2332]">
                <td className="text-[#e6edf3] font-mono py-2 sm:py-3 pr-2 font-medium whitespace-nowrap text-xs">
                  {outlet}
                </td>
                {TOPICS.map((topic) => {
                  const cell = data[outlet]?.[topic];
                  if (!cell) {
                    return (
                      <td key={topic} className="text-center py-2 sm:py-3 px-1">
                        <span className="text-[#30363d] text-[10px]">—</span>
                      </td>
                    );
                  }
                  const color = getColor(cell.score);
                  return (
                    <td key={topic} className="text-center py-2 sm:py-3 px-1">
                      <div
                        className="inline-block rounded-md px-1 sm:px-2 py-0.5 text-[10px] sm:text-xs font-mono font-semibold"
                        style={{
                          color,
                          backgroundColor: `${color}18`,
                        }}
                        title={`${cell.count} articles`}
                      >
                        {cell.score > 0 ? "+" : ""}
                        {cell.score.toFixed(2)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-[10px] sm:text-xs text-[#7d8590] font-mono">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" /> Negative
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" /> Neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#22c55e]" /> Positive
        </span>
      </div>
    </div>
  );
}
