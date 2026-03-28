"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface WordTrendEntry { week: string; terms: { term: string; count: number }[] }
const COLORS = ["#2563eb", "#dc2626", "#d97706", "#059669", "#0891b2", "#7c3aed", "#be185d", "#ea580c"];

export default function WordTrends({ data }: { data: WordTrendEntry[] }) {
  if (!data?.length) return null;

  const globalTerms: Record<string, number> = {};
  for (const week of data) for (const t of week.terms) globalTerms[t.term] = (globalTerms[t.term] || 0) + t.count;
  const topTerms = Object.entries(globalTerms).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([term, count]) => ({ term, count }));

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-3 sm:p-6">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={topTerms} layout="vertical" margin={{ left: 70, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={10} />
          <YAxis type="category" dataKey="term" stroke="#94a3b8" fontSize={11} width={70} />
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {topTerms.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} fillOpacity={0.8} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-5 space-y-2">
        <h3 className="text-xs font-semibold text-[#64748b]">Weekly Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.slice(-6).reverse().map((week) => (
            <div key={week.week} className="p-3 rounded-xl bg-white border border-[#e2e8f0]">
              <div className="text-xs text-[#94a3b8] mb-1.5">Week of {week.week}</div>
              <div className="flex flex-wrap gap-1">
                {week.terms.slice(0, 6).map((t) => (
                  <span key={t.term} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">{t.term} ({t.count})</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
