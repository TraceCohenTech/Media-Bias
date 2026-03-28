"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const OUTLET_COLORS: Record<string, string> = {
  NYT: "#3b82f6",
  WSJ: "#f59e0b",
  Wired: "#ef4444",
  "The Atlantic": "#10b981",
  TechCrunch: "#8b5cf6",
  "The Guardian": "#06b6d4",
};

interface ToneEntry {
  week: string;
  avg_sentiment: number;
  avg_bs: number;
  count: number;
}

export default function ToneComparison({
  data,
}: {
  data: Record<string, ToneEntry[]>;
}) {
  if (!data || Object.keys(data).length === 0) return null;

  const outlets = Object.keys(data);

  // Merge into chart data by week
  const weekSet = new Set<string>();
  for (const entries of Object.values(data)) {
    for (const e of entries) weekSet.add(e.week);
  }
  const weeks = Array.from(weekSet).sort();

  const sentimentData = weeks.map((week) => {
    const point: any = { week };
    for (const outlet of outlets) {
      const entry = data[outlet]?.find((e) => e.week === week);
      if (entry) point[outlet] = entry.avg_sentiment;
    }
    return point;
  });

  const bsData = weeks.map((week) => {
    const point: any = { week };
    for (const outlet of outlets) {
      const entry = data[outlet]?.find((e) => e.week === week);
      if (entry) point[outlet] = entry.avg_bs;
    }
    return point;
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#e6edf3] mb-1 font-mono">
          Tone Change Over Time
        </h2>
        <p className="text-[#7d8590] text-xs mb-5 font-mono">
          Weekly average sentiment by outlet — tracking how coverage tone shifts
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={sentimentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
            <XAxis
              dataKey="week"
              stroke="#7d8590"
              fontSize={11}
              tickFormatter={(d) => {
                const date = new Date(d);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis stroke="#7d8590" fontSize={11} domain={[-0.5, 0.5]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b22",
                border: "1px solid #1a2332",
                borderRadius: "8px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                color: "#e6edf3",
              }}
            />
            <Legend
              wrapperStyle={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
              }}
            />
            {outlets.map((outlet) => (
              <Line
                key={outlet}
                type="monotone"
                dataKey={outlet}
                stroke={OUTLET_COLORS[outlet] || "#666"}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#e6edf3] mb-1 font-mono">
          BS Score Over Time
        </h2>
        <p className="text-[#7d8590] text-xs mb-5 font-mono">
          Weekly average sensationalism score by outlet — higher = more charged language
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={bsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
            <XAxis
              dataKey="week"
              stroke="#7d8590"
              fontSize={11}
              tickFormatter={(d) => {
                const date = new Date(d);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis stroke="#7d8590" fontSize={11} domain={[0, 60]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b22",
                border: "1px solid #1a2332",
                borderRadius: "8px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                color: "#e6edf3",
              }}
            />
            <Legend
              wrapperStyle={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
              }}
            />
            {outlets.map((outlet) => (
              <Line
                key={outlet}
                type="monotone"
                dataKey={outlet}
                stroke={OUTLET_COLORS[outlet] || "#666"}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
