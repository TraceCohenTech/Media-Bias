"use client";

import { OUTLET_COLORS } from "@/lib/constants";

interface ChargedTermsData { [outlet: string]: { term: string; count: number }[] }

export default function ChargedTerms({ data }: { data: ChargedTermsData }) {
  const outlets = Object.keys(data).filter((o) => data[o]?.length > 0);
  if (outlets.length === 0) return null;

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {outlets.map((outlet) => {
          const terms = data[outlet];
          const maxCount = terms[0]?.count || 1;
          const color = OUTLET_COLORS[outlet] || "#94a3b8";
          return (
            <div key={outlet}>
              <h3 className="text-sm font-semibold mb-2.5" style={{ color }}>{outlet}</h3>
              <div className="space-y-1">
                {terms.slice(0, 10).map((t, i) => (
                  <div key={t.term} className="flex items-center gap-2">
                    <span className="text-[#94a3b8] text-xs w-4 text-right">{i + 1}</span>
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 rounded" style={{ width: `${(t.count / maxCount) * 100}%`, backgroundColor: `${color}10` }} />
                      <div className="relative flex items-center justify-between px-2 py-0.5">
                        <span className="text-[#1a1a2e] text-xs font-medium">{t.term}</span>
                        <span className="text-xs font-semibold" style={{ color }}>{t.count}</span>
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
