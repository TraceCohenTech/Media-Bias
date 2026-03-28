"use client";

interface HeatmapData {
  [outlet: string]: {
    [topic: string]: { score: number; count: number };
  };
}

const TOPICS = ["tech", "AI", "regulation", "founder/CEO coverage", "politics", "economy", "security", "climate"];

function getColor(score: number): string {
  if (score > 0.3) return "#22c55e";
  if (score > 0.1) return "#4ade80";
  if (score > -0.1) return "#3b82f6";
  if (score > -0.3) return "#f97316";
  return "#ef4444";
}

function getBgOpacity(score: number): string {
  const abs = Math.abs(score);
  if (abs > 0.5) return "0.4";
  if (abs > 0.3) return "0.3";
  if (abs > 0.1) return "0.2";
  return "0.1";
}

export default function BiasHeatmap({ data }: { data: HeatmapData }) {
  const outlets = Object.keys(data);

  if (outlets.length === 0) {
    return (
      <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#e6edf3] mb-4 font-mono">
          Bias Heatmap — Tech Topics
        </h2>
        <p className="text-[#7d8590] text-sm">No data yet. Click Refresh to fetch feeds.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[#e6edf3] mb-4 font-mono">
        Bias Heatmap — Tech Topics
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-[#7d8590] font-mono font-normal pb-3 pr-4">
                Outlet
              </th>
              {TOPICS.map((topic) => (
                <th
                  key={topic}
                  className="text-center text-[#7d8590] font-mono font-normal pb-3 px-2 text-xs"
                >
                  {topic}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {outlets.map((outlet) => (
              <tr key={outlet} className="border-t border-[#1a2332]">
                <td className="text-[#e6edf3] font-mono py-3 pr-4 font-medium whitespace-nowrap">
                  {outlet}
                </td>
                {TOPICS.map((topic) => {
                  const cell = data[outlet]?.[topic];
                  if (!cell) {
                    return (
                      <td key={topic} className="text-center py-3 px-2">
                        <span className="text-[#30363d] text-xs">—</span>
                      </td>
                    );
                  }
                  const color = getColor(cell.score);
                  return (
                    <td key={topic} className="text-center py-3 px-2">
                      <div
                        className="inline-block rounded-md px-2 py-1 text-xs font-mono font-semibold"
                        style={{
                          color,
                          backgroundColor: `${color}${getBgOpacity(cell.score).replace("0.", "")}`,
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
      <div className="flex items-center gap-4 mt-4 text-xs text-[#7d8590] font-mono">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#ef4444]" /> Negative
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#3b82f6]" /> Neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#22c55e]" /> Positive
        </span>
      </div>
    </div>
  );
}
