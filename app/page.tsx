"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import BiasHeatmap from "@/components/BiasHeatmap";
import ChargedTerms from "@/components/ChargedTerms";
import BiasScores from "@/components/BiasScores";
import BSDetector from "@/components/BSDetector";
import AuthorAnalysis from "@/components/AuthorAnalysis";

const SentimentTrends = dynamic(() => import("@/components/SentimentTrends"), {
  ssr: false,
});
const ToneComparison = dynamic(() => import("@/components/ToneComparison"), {
  ssr: false,
});
const WordTrends = dynamic(() => import("@/components/WordTrends"), {
  ssr: false,
});

interface DashboardData {
  generated_at: string;
  total_articles: number;
  trends: any[];
  heatmap: any;
  chargedTerms: any;
  biasScores: any[];
  recentArticles: any[];
  toneTimelines: any;
  authorStats: any[];
  wordTrends: any[];
  topBsArticles: any[];
  toneOverTime: any;
}

type Tab = "overview" | "bs-detector" | "writers" | "language" | "articles";

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data.json")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
        <div className="text-[#3b82f6] font-mono text-lg animate-pulse">
          Loading media bias data...
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "bs-detector", label: "BS Detector" },
    { id: "writers", label: "Writers" },
    { id: "language", label: "Language" },
    { id: "articles", label: "All Articles" },
  ];

  return (
    <main className="min-h-screen bg-[#080b12] text-[#e6edf3] font-mono">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-[#3b82f6]">Media Bias</span>{" "}
            <span className="text-[#e6edf3]">Sentiment Monitor</span>
          </h1>
          <p className="text-[#7d8590] text-sm mt-1">
            {data?.total_articles || 0} articles analyzed across 6 outlets
            {data?.generated_at && (
              <> — data as of {new Date(data.generated_at).toLocaleDateString()}</>
            )}
          </p>
        </div>

        {/* Stats bar */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-4">
              <div className="text-2xl font-bold text-[#3b82f6]">{data.total_articles}</div>
              <div className="text-xs text-[#7d8590]">Articles Analyzed</div>
            </div>
            <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-4">
              <div className="text-2xl font-bold text-[#e6edf3]">{data.biasScores?.length || 0}</div>
              <div className="text-xs text-[#7d8590]">Outlets Tracked</div>
            </div>
            <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-4">
              <div className="text-2xl font-bold text-[#f59e0b]">{data.authorStats?.length || 0}</div>
              <div className="text-xs text-[#7d8590]">Writers Profiled</div>
            </div>
            <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-4">
              <div className="text-2xl font-bold text-[#ef4444]">
                {data.topBsArticles?.[0]?.bs_score || 0}
              </div>
              <div className="text-xs text-[#7d8590]">Highest BS Score</div>
            </div>
          </div>
        )}

        {/* Feed indicators */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(data?.biasScores || []).map((b: any) => (
            <div
              key={b.outlet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border border-[#22c55e33] text-[#22c55e]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              {b.outlet}
              <span className="text-[#7d8590] ml-1">{b.total_articles}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#1a2332] pb-px overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-mono font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "text-[#3b82f6] bg-[#0d1117] border border-[#1a2332] border-b-[#080b12] -mb-px"
                  : "text-[#7d8590] hover:text-[#e6edf3]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {tab === "overview" && (
            <>
              <SentimentTrends data={data?.trends || []} />
              <ToneComparison data={data?.toneOverTime || {}} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BiasHeatmap data={data?.heatmap || {}} />
                <BiasScores data={data?.biasScores || []} />
              </div>
              <ChargedTerms data={data?.chargedTerms || {}} />
            </>
          )}

          {tab === "bs-detector" && (
            <>
              {/* BS Score by outlet summary */}
              <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#e6edf3] mb-4 font-mono">
                  Average BS Score by Outlet
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(data?.biasScores || [])
                    .sort((a: any, b: any) => (b.avg_bs_score || 0) - (a.avg_bs_score || 0))
                    .map((b: any) => {
                      const bsColor =
                        b.avg_bs_score >= 40
                          ? "#ef4444"
                          : b.avg_bs_score >= 25
                          ? "#f59e0b"
                          : b.avg_bs_score >= 15
                          ? "#3b82f6"
                          : "#22c55e";
                      return (
                        <div
                          key={b.outlet}
                          className="text-center p-4 rounded-lg border border-[#1a2332]"
                        >
                          <div
                            className="text-3xl font-bold font-mono"
                            style={{ color: bsColor }}
                          >
                            {b.avg_bs_score || 0}
                          </div>
                          <div className="text-xs text-[#e6edf3] font-mono mt-1">
                            {b.outlet}
                          </div>
                          <div className="text-[10px] text-[#7d8590] font-mono">
                            {b.total_articles} articles
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              <BSDetector data={data?.topBsArticles || []} />
            </>
          )}

          {tab === "writers" && (
            <AuthorAnalysis data={data?.authorStats || []} />
          )}

          {tab === "language" && (
            <WordTrends data={data?.wordTrends || []} />
          )}

          {tab === "articles" && (
            <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#e6edf3] mb-4 font-mono">
                All Articles ({data?.recentArticles?.length || 0})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#7d8590] text-xs font-mono">
                      <th className="text-left pb-3 pr-3">Outlet</th>
                      <th className="text-left pb-3 pr-3">Date</th>
                      <th className="text-left pb-3 pr-3">Headline</th>
                      <th className="text-left pb-3 pr-3">Author</th>
                      <th className="text-center pb-3 pr-3">Sentiment</th>
                      <th className="text-center pb-3 pr-3">BS</th>
                      <th className="text-left pb-3">Topics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recentArticles || []).map((article: any, i: number) => (
                      <tr
                        key={i}
                        className="border-t border-[#1a2332] hover:bg-[#161b22] transition-colors"
                      >
                        <td className="py-2 pr-3 text-[#e6edf3] font-mono text-xs font-semibold whitespace-nowrap">
                          {article.outlet}
                        </td>
                        <td className="py-2 pr-3 text-[#7d8590] text-xs whitespace-nowrap">
                          {article.date}
                        </td>
                        <td className="py-2 pr-3 text-[#e6edf3] text-xs max-w-sm">
                          <div className="line-clamp-2">{article.headline}</div>
                        </td>
                        <td className="py-2 pr-3 text-[#7d8590] text-xs whitespace-nowrap max-w-[120px] truncate">
                          {article.author || "—"}
                        </td>
                        <td className="py-2 pr-3 text-center">
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
                        <td className="py-2 pr-3 text-center">
                          <span
                            className="text-xs font-mono font-semibold"
                            style={{
                              color:
                                article.bs_score >= 40
                                  ? "#ef4444"
                                  : article.bs_score >= 20
                                  ? "#f59e0b"
                                  : "#22c55e",
                            }}
                          >
                            {article.bs_score || 0}
                          </span>
                        </td>
                        <td className="py-2">
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              try {
                                return JSON.parse(article.topics || "[]").map(
                                  (t: string) => (
                                    <span
                                      key={t}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1a2332] text-[#7d8590]"
                                    >
                                      {t}
                                    </span>
                                  )
                                );
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
            </div>
          )}
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
