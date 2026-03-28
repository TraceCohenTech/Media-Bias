"use client";

interface ChargedTermsData {
  [outlet: string]: { term: string; count: number }[];
}

const OUTLET_COLORS: Record<string, string> = {
  NYT: "#3b82f6",
  WSJ: "#f59e0b",
  Wired: "#ef4444",
  "The Atlantic": "#10b981",
  TechCrunch: "#8b5cf6",
  "The Guardian": "#06b6d4",
};

export default function ChargedTerms({ data }: { data: ChargedTermsData }) {
  const outlets = Object.keys(data);

  if (outlets.length === 0) {
    return (
      <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#e6edf3] mb-4 font-mono">
          Charged Language by Outlet
        </h2>
        <p className="text-[#7d8590] text-sm">No data yet. Click Refresh to fetch feeds.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
      <h2 className="text-lg font-semibold text-[#e6edf3] mb-4 font-mono">
        Charged Language by Outlet
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outlets.map((outlet) => {
          const terms = data[outlet];
          const maxCount = terms[0]?.count || 1;
          const color = OUTLET_COLORS[outlet] || "#7d8590";

          return (
            <div key={outlet}>
              <h3
                className="text-sm font-mono font-semibold mb-3"
                style={{ color }}
              >
                {outlet}
              </h3>
              <div className="space-y-1.5">
                {terms.slice(0, 10).map((t, i) => (
                  <div key={t.term} className="flex items-center gap-2">
                    <span className="text-[#7d8590] text-xs font-mono w-4 text-right">
                      {i + 1}
                    </span>
                    <div className="flex-1 relative">
                      <div
                        className="absolute inset-y-0 left-0 rounded-sm"
                        style={{
                          width: `${(t.count / maxCount) * 100}%`,
                          backgroundColor: `${color}15`,
                        }}
                      />
                      <div className="relative flex items-center justify-between px-2 py-0.5">
                        <span className="text-[#e6edf3] text-xs font-mono">
                          {t.term}
                        </span>
                        <span
                          className="text-xs font-mono font-semibold"
                          style={{ color }}
                        >
                          {t.count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
