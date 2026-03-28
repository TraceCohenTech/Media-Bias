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

interface TrendEntry {
  outlet: string;
  date: string;
  avg_score: number;
  article_count: number;
}

export default function SentimentTrends({ data }: { data: TrendEntry[] }) {
  const dateMap: Record<string, any> = {};
  const outlets = new Set<string>();

  for (const entry of data) {
    outlets.add(entry.outlet);
    if (!dateMap[entry.date]) {
      dateMap[entry.date] = { date: entry.date };
    }
    dateMap[entry.date][entry.outlet] = parseFloat(entry.avg_score.toFixed(3));
  }

  const chartData = Object.values(dateMap).sort((a: any, b: any) =>
    a.date.localeCompare(b.date)
  );

  if (chartData.length === 0) return null;

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ left: -10, right: 5, top: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
          <XAxis
            dataKey="date"
            stroke="#7d8590"
            fontSize={10}
            tickFormatter={(d) => {
              const date = new Date(d);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#7d8590"
            fontSize={10}
            domain={[-1, 1]}
            ticks={[-1, -0.5, 0, 0.5, 1]}
            width={35}
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
          />
          <Legend
            wrapperStyle={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
            }}
          />
          {Array.from(outlets).map((outlet) => (
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
  );
}
