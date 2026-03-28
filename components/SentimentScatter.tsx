"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
} from "recharts";

const OUTLET_COLORS: Record<string, string> = {
  NYT: "#3b82f6",
  WSJ: "#f59e0b",
  Wired: "#ef4444",
  "The Atlantic": "#10b981",
  TechCrunch: "#8b5cf6",
  "The Guardian": "#06b6d4",
};

interface Article {
  outlet: string;
  headline: string;
  sentiment_score: number;
  bs_score: number;
  author?: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#161b22] border border-[#1a2332] rounded-lg p-3 max-w-xs shadow-xl">
      <div className="text-[#e6edf3] text-xs font-mono leading-snug mb-1.5">
        {d.headline}
      </div>
      <div className="flex items-center gap-2 text-[10px] font-mono">
        <span style={{ color: OUTLET_COLORS[d.outlet] || "#7d8590" }}>
          {d.outlet}
        </span>
        <span className="text-[#7d8590]">
          Sentiment: {d.sentiment_score > 0 ? "+" : ""}{d.sentiment_score.toFixed(2)}
        </span>
        <span className="text-[#7d8590]">BS: {d.bs_score}</span>
      </div>
    </div>
  );
}

export default function SentimentScatter({ data }: { data: Article[] }) {
  if (!data?.length) return null;

  const outlets = Array.from(new Set(data.map((d) => d.outlet)));

  // Quadrant counts
  const quadrants = { tl: 0, tr: 0, bl: 0, br: 0 };
  data.forEach((d) => {
    const neg = d.sentiment_score < 0;
    const high = d.bs_score >= 12;
    if (neg && high) quadrants.tl++;
    else if (!neg && high) quadrants.tr++;
    else if (neg && !high) quadrants.bl++;
    else quadrants.br++;
  });

  return (
    <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
        {outlets.map((outlet) => (
          <div key={outlet} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: OUTLET_COLORS[outlet] || "#666" }}
            />
            <span className="text-[10px] sm:text-xs font-mono text-[#7d8590]">
              {outlet}
            </span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />

          {/* Quadrant backgrounds */}
          <ReferenceArea x1={-1} x2={0} y1={12} y2={40} fill="#ef4444" fillOpacity={0.03} />
          <ReferenceArea x1={0} x2={1} y1={12} y2={40} fill="#f59e0b" fillOpacity={0.03} />
          <ReferenceArea x1={-1} x2={0} y1={0} y2={12} fill="#3b82f6" fillOpacity={0.03} />
          <ReferenceArea x1={0} x2={1} y1={0} y2={12} fill="#22c55e" fillOpacity={0.03} />

          <XAxis
            type="number"
            dataKey="sentiment_score"
            domain={[-0.6, 0.6]}
            stroke="#7d8590"
            fontSize={10}
            tickFormatter={(v) => (v > 0 ? `+${v}` : `${v}`)}
            label={{
              value: "Sentiment Score",
              position: "bottom",
              offset: 15,
              style: { fill: "#7d8590", fontSize: 10, fontFamily: "JetBrains Mono" },
            }}
          />
          <YAxis
            type="number"
            dataKey="bs_score"
            domain={[0, 35]}
            stroke="#7d8590"
            fontSize={10}
            width={30}
            label={{
              value: "BS Score",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fill: "#7d8590", fontSize: 10, fontFamily: "JetBrains Mono" },
            }}
          />

          <ReferenceLine x={0} stroke="#30363d" strokeWidth={1} />
          <ReferenceLine y={12} stroke="#30363d" strokeWidth={1} strokeDasharray="4 4" />

          <Tooltip content={<CustomTooltip />} />

          <Scatter data={data} fillOpacity={0.6}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={OUTLET_COLORS[entry.outlet] || "#666"}
                r={4}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant labels */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] sm:text-xs font-mono">
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#ef444408] border border-[#ef444415]">
          <span className="text-[#ef4444]">Negative + Sensational</span>
          <span className="text-[#7d8590]">{quadrants.tl}</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#f59e0b08] border border-[#f59e0b15]">
          <span className="text-[#f59e0b]">Positive + Sensational</span>
          <span className="text-[#7d8590]">{quadrants.tr}</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#3b82f608] border border-[#3b82f615]">
          <span className="text-[#3b82f6]">Negative + Measured</span>
          <span className="text-[#7d8590]">{quadrants.bl}</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#22c55e08] border border-[#22c55e15]">
          <span className="text-[#22c55e]">Positive + Measured</span>
          <span className="text-[#7d8590]">{quadrants.br}</span>
        </div>
      </div>
    </div>
  );
}
