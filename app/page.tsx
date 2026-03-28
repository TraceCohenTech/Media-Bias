"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import BiasHeatmap from "@/components/BiasHeatmap";
import ChargedTerms from "@/components/ChargedTerms";
import BiasScores from "@/components/BiasScores";

const SentimentTrends = dynamic(
  () => import("@/components/SentimentTrends"),
  { ssr: false }
);

interface DashboardData {
  trends: any[];
  heatmap: any;
  chargedTerms: any;
  biasScores: any[];
  recentArticles: any[];
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [refreshResult, setRefreshResult] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshResult(null);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setRefreshResult(
          `Fetched ${json.inserted} articles, scored ${json.scored} — ${json.feeds.map((f: any) => `${f.outlet}: ${f.items}`).join(", ")}`
        );
        setLastRefresh(new Date().toLocaleTimeString());
        await fetchData();
      } else {
        setRefreshResult(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setRefreshResult(`Error: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080b12] text-[#e6edf3] font-mono">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-[#3b82f6]">Media Bias</span>{" "}
              <span className="text-[#e6edf3]">Sentiment Monitor</span>
            </h1>
            <p className="text-[#7d8590] text-sm mt-1">
              Real-time sentiment analysis across major outlets — 90-day rolling window
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {lastRefresh && (
              <span className="text-xs text-[#7d8590]">
                Last refresh: {lastRefresh}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-mono font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Fetching &amp; Scoring...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Feeds
                </>
              )}
            </button>
          </div>
        </div>

        {/* Refresh result banner */}
        {refreshResult && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-mono ${
              refreshResult.startsWith("Error")
                ? "bg-[#ef44441a] text-[#ef4444] border border-[#ef444433]"
                : "bg-[#22c55e1a] text-[#22c55e] border border-[#22c55e33]"
            }`}
          >
            {refreshResult}
          </div>
        )}

        {/* Feed status indicators */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["NYT", "WSJ", "Wired", "The Atlantic", "TechCrunch", "The Guardian"].map(
            (outlet) => {
              const hasData = data?.biasScores?.some(
                (b: any) => b.outlet === outlet
              );
              return (
                <div
                  key={outlet}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border"
                  style={{
                    borderColor: hasData ? "#22c55e33" : "#30363d",
                    color: hasData ? "#22c55e" : "#7d8590",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: hasData ? "#22c55e" : "#30363d",
                    }}
                  />
                  {outlet}
                </div>
              );
            }
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border border-[#3b82f633] text-[#3b82f6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
            GDELT
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="space-y-6">
          <SentimentTrends data={data?.trends || []} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BiasHeatmap data={data?.heatmap || {}} />
            <BiasScores data={data?.biasScores || []} />
          </div>

          <ChargedTerms data={data?.chargedTerms || {}} />

          {/* Recent Articles */}
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[#e6edf3] mb-4 font-mono">
              Recent Articles
            </h2>
            {data?.recentArticles && data.recentArticles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#7d8590] text-xs font-mono">
                      <th className="text-left pb-3 pr-4">Outlet</th>
                      <th className="text-left pb-3 pr-4">Date</th>
                      <th className="text-left pb-3 pr-4">Headline</th>
                      <th className="text-center pb-3 pr-4">Score</th>
                      <th className="text-left pb-3">Topics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentArticles.map((article: any, i: number) => (
                      <tr
                        key={i}
                        className="border-t border-[#1a2332] hover:bg-[#161b22] transition-colors"
                      >
                        <td className="py-2.5 pr-4 text-[#e6edf3] font-mono text-xs font-semibold whitespace-nowrap">
                          {article.outlet}
                        </td>
                        <td className="py-2.5 pr-4 text-[#7d8590] text-xs whitespace-nowrap">
                          {article.date}
                        </td>
                        <td className="py-2.5 pr-4 text-[#e6edf3] text-xs max-w-md">
                          <div className="line-clamp-2">{article.headline}</div>
                        </td>
                        <td className="py-2.5 pr-4 text-center">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold"
                            style={{
                              color:
                                article.sentiment_score > 0.1
                                  ? "#22c55e"
                                  : article.sentiment_score < -0.1
                                  ? "#ef4444"
                                  : "#3b82f6",
                              backgroundColor:
                                article.sentiment_score > 0.1
                                  ? "#22c55e15"
                                  : article.sentiment_score < -0.1
                                  ? "#ef444415"
                                  : "#3b82f615",
                            }}
                          >
                            {article.sentiment_score > 0 ? "+" : ""}
                            {article.sentiment_score?.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              try {
                                const topics = JSON.parse(
                                  article.topics || "[]"
                                );
                                return topics.map((t: string) => (
                                  <span
                                    key={t}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1a2332] text-[#7d8590]"
                                  >
                                    {t}
                                  </span>
                                ));
                              } catch {
                                return null;
                              }
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[#7d8590] text-sm">
                No data yet. Click Refresh to fetch feeds.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[#1a2332] flex items-center justify-between text-xs text-[#7d8590] font-mono">
          <span>Media Bias Sentiment Monitor</span>
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/Trace_Cohen"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#e6edf3] transition-colors"
            >
              Twitter
            </a>
            <a
              href="mailto:t@nyvp.com"
              className="hover:text-[#e6edf3] transition-colors"
            >
              t@nyvp.com
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
