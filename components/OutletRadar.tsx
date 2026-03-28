"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { OUTLET_COLORS } from "@/lib/constants";


const SHORT_TOPICS: Record<string, string> = {
  "AI / ML": "AI",
  "startups / founders": "Startups",
  "VC / funding": "VC",
  "big tech": "Big Tech",
  "CEO / billionaire": "CEOs",
  "regulation / antitrust": "Regulation",
  "cybersecurity": "Security",
  "crypto / web3": "Crypto",
};

interface HeatmapData {
  [outlet: string]: {
    [topic: string]: { score: number; count: number };
  };
}

export default function OutletRadar({ data }: { data: HeatmapData }) {
  const outlets = Object.keys(data);
  if (outlets.length === 0) return null;

  const topics = Object.keys(SHORT_TOPICS);

  // Transform: each topic becomes a data point with outlet scores
  // Shift scores to 0-1 range for radar (add 0.5 so -0.5 becomes 0, +0.5 becomes 1)
  const radarData = topics.map((topic) => {
    const point: any = { topic: SHORT_TOPICS[topic] || topic };
    for (const outlet of outlets) {
      const cell = data[outlet]?.[topic];
      point[outlet] = cell ? parseFloat((cell.score + 0.5).toFixed(3)) : 0.5;
    }
    return point;
  });

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#1a2332" />
          <PolarAngleAxis
            dataKey="topic"
            tick={{
              fill: "#7d8590",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
          />
          <PolarRadiusAxis
            domain={[0, 1]}
            tick={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161b22",
              border: "1px solid #1a2332",
              borderRadius: "8px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
              color: "#e6edf3",
            }}
            formatter={(value: any, name: any) => {
              const v = Number(value) - 0.5;
              return [`${v > 0 ? "+" : ""}${v.toFixed(3)}`, name];
            }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
            }}
          />
          {outlets.map((outlet) => (
            <Radar
              key={outlet}
              name={outlet}
              dataKey={outlet}
              stroke={OUTLET_COLORS[outlet] || "#666"}
              fill={OUTLET_COLORS[outlet] || "#666"}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
      <div className="text-center text-[10px] text-[#7d8590] font-mono mt-2">
        Center = negative (-0.5) / Edge = positive (+0.5) / Middle ring = neutral (0)
      </div>
    </div>
  );
}
