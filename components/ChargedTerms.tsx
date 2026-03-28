"use client";

import { OUTLET_COLORS } from "@/lib/constants";

interface ChargedTermsData {
  [outlet: string]: { term: string; count: number }[];
}


export default function ChargedTerms({ data }: { data: ChargedTermsData }) {
  const outlets = Object.keys(data).filter((o) => data[o]?.length > 0);
  if (outlets.length === 0) return null;

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {outlets.map((outlet) => {
          const terms = data[outlet];
          const maxCount = terms[0]?.count || 1;
          const color = OUTLET_COLORS[outlet] || "#7d8590";

          return (
            <div key={outlet}>
              <h3
                className="text-xs sm:text-sm font-mono font-semibold mb-2 sm:mb-3"
                style={{ color }}
              >
                {outlet}
              </h3>
              <div className="space-y-1">
                {terms.slice(0, 10).map((t, i) => (
                  <div key={t.term} className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[#7d8590] text-[10px] sm:text-xs font-mono w-3 sm:w-4 text-right">
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
                      <div className="relative flex items-center justify-between px-1.5 sm:px-2 py-0.5">
                        <span className="text-[#e6edf3] text-[10px] sm:text-xs font-mono">
                          {t.term}
                        </span>
                        <span
                          className="text-[10px] sm:text-xs font-mono font-semibold"
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
