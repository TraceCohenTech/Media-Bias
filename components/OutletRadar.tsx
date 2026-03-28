"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { OUTLET_COLORS } from "@/lib/constants";

const SHORT_TOPICS: Record<string, string> = {
  "AI / ML": "AI", "startups / founders": "Startups", "VC / funding": "VC",
  "big tech": "Big Tech", "CEO / billionaire": "CEOs", "regulation / antitrust": "Regulation",
  "cybersecurity": "Security", "crypto / web3": "Crypto",
};

interface HeatmapData { [outlet: string]: { [topic: string]: { score: number; count: number } } }

export default function OutletRadar({ data }: { data: HeatmapData }) {
  const allOutlets = Object.keys(data);
  if (allOutlets.length === 0) return null;

  const outletCoverage = allOutlets.map((o) => ({
    outlet: o,
    count: Object.values(data[o] || {}).reduce((sum: number, v: any) => sum + (v.count || 0), 0),
  }));
  outletCoverage.sort((a, b) => b.count - a.count);
  const outlets = outletCoverage.slice(0, 8).map((o) => o.outlet);
  const topics = Object.keys(SHORT_TOPICS);

  const radarData = topics.map((topic) => {
    const point: any = { topic: SHORT_TOPICS[topic] || topic };
    for (const outlet of outlets) {
      const cell = data[outlet]?.[topic];
      point[outlet] = cell ? parseFloat((cell.score + 0.5).toFixed(3)) : 0.5;
    }
    return point;
  });

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-3 sm:p-6">
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="topic" tick={{ fill: "#64748b", fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#1a1a2e", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            formatter={(value: any, name: any) => { const v = Number(value) - 0.5; return [`${v > 0 ? "+" : ""}${v.toFixed(3)}`, name]; }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          {outlets.map((outlet) => (
            <Radar key={outlet} name={outlet} dataKey={outlet} stroke={OUTLET_COLORS[outlet] || "#94a3b8"} fill={OUTLET_COLORS[outlet] || "#94a3b8"} fillOpacity={0.08} strokeWidth={2} />
          ))}
        </RadarChart>
      </ResponsiveContainer>
      <div className="text-center text-xs text-[#94a3b8] mt-2">Center = negative / Edge = positive / Middle = neutral</div>
    </div>
  );
}
