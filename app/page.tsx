"use client";

import { useState, useEffect, useMemo } from "react";
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

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg sm:text-xl font-bold text-[#e6edf3] font-mono">
        {title}
      </h2>
      <p className="text-[#7d8590] text-xs sm:text-sm mt-1 font-mono leading-relaxed max-w-3xl">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
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

  // Filter tech/AI-focused articles
  const techArticles = useMemo(() => {
    if (!data?.recentArticles) return [];
    return data.recentArticles.filter((a: any) => {
      try {
        const topics = JSON.parse(a.topics || "[]");
        return (
          topics.includes("tech") ||
          topics.includes("AI") ||
          topics.includes("founder/CEO coverage") ||
          topics.includes("security")
        );
      } catch {
        return false;
      }
    });
  }, [data]);

  const techBsArticles = useMemo(() => {
    if (!data?.topBsArticles) return [];
    return data.topBsArticles.filter((a: any) => {
      const hl = a.headline?.toLowerCase() || "";
      return (
        hl.includes("tech") ||
        hl.includes("ai ") ||
        hl.includes("startup") ||
        hl.includes("artificial") ||
        hl.includes("ceo") ||
        hl.includes("venture") ||
        hl.includes("funding") ||
        hl.includes("google") ||
        hl.includes("apple") ||
        hl.includes("meta") ||
        hl.includes("microsoft") ||
        hl.includes("amazon") ||
        hl.includes("openai") ||
        hl.includes("anthropic") ||
        hl.includes("crypto") ||
        hl.includes("software") ||
        hl.includes("chip") ||
        hl.includes("data") ||
        a.flagged_terms?.length > 0
      );
    });
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
        <div className="text-[#3b82f6] font-mono text-lg animate-pulse">
          Loading media bias data...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
        <div className="text-[#ef4444] font-mono text-lg">
          Failed to load data.
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080b12] text-[#e6edf3]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {/* ── Hero ── */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-mono">
            <span className="text-[#3b82f6]">Media Bias</span>{" "}
            <span className="text-[#e6edf3]">Sentiment Monitor</span>
          </h1>
          <p className="text-[#7d8590] text-sm sm:text-base mt-2 font-mono leading-relaxed max-w-3xl">
            How do major news outlets cover technology, startups, and venture
            capital? This dashboard analyzes{" "}
            <span className="text-[#e6edf3] font-semibold">
              {data.total_articles} articles
            </span>{" "}
            from 6 major outlets for sentiment, charged language, and
            sensationalism — with a focus on tech sector coverage.
          </p>
          <p className="text-[#7d8590] text-xs mt-2 font-mono">
            Data collected{" "}
            {new Date(data.generated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            via RSS feeds and GDELT Project
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-8 sm:mb-12">
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-[#3b82f6] font-mono">
              {data.total_articles}
            </div>
            <div className="text-[10px] sm:text-xs text-[#7d8590] font-mono">
              Articles Analyzed
            </div>
          </div>
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-[#e6edf3] font-mono">
              {data.biasScores?.length || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-[#7d8590] font-mono">
              Outlets Tracked
            </div>
          </div>
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-[#f59e0b] font-mono">
              {techArticles.length}
            </div>
            <div className="text-[10px] sm:text-xs text-[#7d8590] font-mono">
              Tech/AI Articles
            </div>
          </div>
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-[#ef4444] font-mono">
              {data.topBsArticles?.[0]?.bs_score || 0}
            </div>
            <div className="text-[10px] sm:text-xs text-[#7d8590] font-mono">
              Peak BS Score
            </div>
          </div>
        </div>

        {/* ── Feed indicators ── */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-8 sm:mb-12">
          {(data.biasScores || []).map((b: any) => (
            <div
              key={b.outlet}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono border border-[#22c55e33] text-[#22c55e]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              {b.outlet}
              <span className="text-[#7d8590] ml-0.5">{b.total_articles}</span>
            </div>
          ))}
        </div>

        {/* ── Section 1: Tech Sector Sentiment ── */}
        <section className="mb-10 sm:mb-14">
          <SectionHeader
            title="Tech Sector Sentiment Trends"
            description="How positive or negative is each outlet when covering technology, AI, startups, and venture capital? This chart shows the average daily sentiment score per outlet over time. A score of +1.0 is maximally positive coverage, -1.0 is maximally negative, and 0 is neutral. Large divergences between outlets on the same day suggest editorial bias rather than news-driven sentiment."
          />
          <SentimentTrends data={data.trends || []} />
        </section>

        {/* ── Section 2: Tone Over Time ── */}
        <section className="mb-10 sm:mb-14">
          <SectionHeader
            title="How Outlet Tone Changes Over Time"
            description="Weekly rolling averages smooth out daily noise and reveal sustained shifts in coverage tone. When an outlet's sentiment line drops or spikes for multiple weeks, it often correlates with editorial positioning on a major story (AI regulation, layoffs, funding cycles). The BS Score chart below tracks sensationalism — how much charged language each outlet uses week over week."
          />
          <ToneComparison data={data.toneOverTime || {}} />
        </section>

        {/* ── Section 3: Bias Heatmap + Scores ── */}
        <section className="mb-10 sm:mb-14">
          <SectionHeader
            title="Outlet Bias by Topic"
            description="Not all bias is uniform — an outlet may cover AI positively but regulation negatively. This heatmap breaks down average sentiment by outlet and topic. The bias score card shows each outlet's overall lean across all coverage, with article counts and positive/negative/neutral breakdowns."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <BiasHeatmap data={data.heatmap || {}} />
            <BiasScores data={data.biasScores || []} />
          </div>
        </section>

        {/* ── Section 4: BS Detector ── */}
        <section className="mb-10 sm:mb-14">
          <SectionHeader
            title="BS Detector — Sensationalism Scores"
            description={"Every article is scored 0\u2013100 for sensationalism based on three factors: (1) charged language density \u2014 how many loaded words like \u201Cslammed,\u201D \u201Crevolutionary,\u201D or \u201Cunprecedented\u201D appear; (2) sentiment extremity \u2014 how far the score deviates from neutral; and (3) clickbait patterns \u2014 question headlines, exclamation marks, ALL CAPS. Higher scores mean more editorializing and less straight reporting."}
          />
          {/* BS by outlet summary */}
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-sm font-semibold text-[#e6edf3] mb-3 font-mono">
              Average BS Score by Outlet
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {[...data.biasScores]
                .sort(
                  (a: any, b: any) =>
                    (b.avg_bs_score || 0) - (a.avg_bs_score || 0)
                )
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
                      className="text-center p-2 sm:p-3 rounded-lg border border-[#1a2332]"
                    >
                      <div
                        className="text-2xl sm:text-3xl font-bold font-mono"
                        style={{ color: bsColor }}
                      >
                        {b.avg_bs_score || 0}
                      </div>
                      <div className="text-[10px] sm:text-xs text-[#e6edf3] font-mono mt-1 truncate">
                        {b.outlet}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          <BSDetector
            data={
              techBsArticles.length > 5
                ? techBsArticles
                : data.topBsArticles || []
            }
          />
        </section>

        {/* ── Section 5: Charged Language ── */}
        <section className="mb-10 sm:mb-14">
          <SectionHeader
            title="Charged Language Analysis"
            description={"Which outlets use the most loaded language? Charged terms are words designed to trigger emotional reactions rather than inform \u2014 \u201Cslammed,\u201D \u201Cdestroyed,\u201D \u201Cgame-changing,\u201D \u201Cunprecedented.\u201D We track ~300 such terms across all articles. The ranked lists show each outlet\u2019s most-used charged words, and the chart shows global trends over time."}
          />
          <div className="space-y-4 sm:space-y-6">
            <ChargedTerms data={data.chargedTerms || {}} />
            <WordTrends data={data.wordTrends || []} />
          </div>
        </section>

        {/* ── Section 6: Writer Analysis ── */}
        <section className="mb-10 sm:mb-14">
          <SectionHeader
            title="Writer-Level Analysis"
            description={"Bias isn\u2019t just institutional \u2014 individual writers have their own patterns. This table shows authors with 2+ articles in our dataset, ranked by their average BS score. High BS + negative sentiment often indicates opinion-heavy coverage framed as news. Writers with consistently neutral scores tend to be straight news reporters."}
          />
          <AuthorAnalysis data={data.authorStats || []} />
        </section>

        {/* ── Section 7: Tech/AI Articles Feed ── */}
        <section className="mb-10 sm:mb-14">
          <SectionHeader
            title="Tech & AI Coverage Feed"
            description="Every article in our dataset tagged with technology, AI, startup, or founder/CEO topics. Click any headline to read the source article and verify our scoring. Sentiment and BS scores are computed algorithmically — see Methodology below for exactly how."
          />
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-4 sm:p-6">
            <div className="text-xs text-[#7d8590] font-mono mb-4">
              Showing {techArticles.length} tech-focused articles
            </div>
            {/* Mobile: card layout, Desktop: table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#7d8590] text-xs font-mono">
                    <th className="text-left pb-3 pr-3">Outlet</th>
                    <th className="text-left pb-3 pr-3">Date</th>
                    <th className="text-left pb-3 pr-3">Headline</th>
                    <th className="text-left pb-3 pr-3">Author</th>
                    <th className="text-center pb-3 pr-3">Sentiment</th>
                    <th className="text-center pb-3">BS</th>
                  </tr>
                </thead>
                <tbody>
                  {techArticles.map((article: any, i: number) => (
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
                      <td className="py-2 pr-3 text-xs max-w-md">
                        <span className="text-[#e6edf3] line-clamp-2">
                          {article.headline}
                        </span>
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
                      <td className="py-2 text-center">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="lg:hidden space-y-2">
              {techArticles.slice(0, 50).map((article: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-[#1a2332]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-semibold text-[#3b82f6]">
                      {article.outlet}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
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
                      <span
                        className="text-[10px] font-mono font-semibold"
                        style={{
                          color:
                            article.bs_score >= 40
                              ? "#ef4444"
                              : article.bs_score >= 20
                              ? "#f59e0b"
                              : "#22c55e",
                        }}
                      >
                        BS:{article.bs_score || 0}
                      </span>
                    </div>
                  </div>
                  <div className="text-[#e6edf3] text-xs font-mono leading-snug">
                    {article.headline}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#7d8590] font-mono">
                    <span>{article.date}</span>
                    {article.author && <span>{article.author}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 8: Source Articles ── */}
        <section className="mb-10 sm:mb-14">
          <SectionHeader
            title="Source Articles — Verify Yourself"
            description="Transparency matters. Below are recent headlines with direct links to the original articles. Read the source, check our sentiment score, and decide for yourself if our analysis holds up."
          />
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-4 sm:p-6">
            <div className="space-y-3">
              {(data.recentArticles || [])
                .filter((a: any) => {
                  try {
                    const topics = JSON.parse(a.topics || "[]");
                    return topics.includes("tech") || topics.includes("AI");
                  } catch {
                    return false;
                  }
                })
                .slice(0, 25)
                .map((article: any, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2 border-b border-[#1a2332] last:border-0"
                  >
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] sm:text-xs font-mono font-semibold text-[#3b82f6] w-24 sm:w-28">
                        {article.outlet}
                      </span>
                      <span className="text-[10px] sm:text-xs font-mono text-[#7d8590]">
                        {article.date}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#e6edf3] flex-1">
                      {article.headline}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
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
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* ── Section 9: Methodology ── */}
        <section className="mb-10 sm:mb-14" id="methodology">
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-4 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-[#e6edf3] font-mono mb-4">
              Methodology & Data Sources
            </h2>
            <div className="space-y-6 text-xs sm:text-sm font-mono text-[#7d8590] leading-relaxed">
              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  Data Collection
                </h3>
                <p>
                  Articles are collected from public RSS feeds published by each
                  outlet. RSS feeds are freely available XML endpoints that news
                  organizations publish for syndication. We also pull from the{" "}
                  <a
                    href="https://www.gdeltproject.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b82f6] hover:underline"
                  >
                    GDELT Project
                  </a>{" "}
                  — the largest open database of human society, monitoring the
                  world&apos;s broadcast, print, and web news in 100+ languages.
                  GDELT data extends coverage back 120 days.
                </p>
              </div>

              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  RSS Feed Sources
                </h3>
                <ul className="space-y-1">
                  <li>
                    <span className="text-[#e6edf3]">NYT</span> —{" "}
                    <span className="text-[#3b82f6]">
                      rss.nytimes.com/services/xml/rss/nyt/
                    </span>{" "}
                    (Technology, Business, Politics, Science)
                  </li>
                  <li>
                    <span className="text-[#e6edf3]">WSJ</span> —{" "}
                    <span className="text-[#3b82f6]">
                      feeds.content.dowjones.io/public/rss/
                    </span>{" "}
                    (Markets, World News, WSJ Digital)
                  </li>
                  <li>
                    <span className="text-[#e6edf3]">Wired</span> —{" "}
                    <span className="text-[#3b82f6]">wired.com/feed/</span>{" "}
                    (Main, Business, Security)
                  </li>
                  <li>
                    <span className="text-[#e6edf3]">The Atlantic</span> —{" "}
                    <span className="text-[#3b82f6]">
                      theatlantic.com/feed/channel/
                    </span>{" "}
                    (Technology, Politics, Business)
                  </li>
                  <li>
                    <span className="text-[#e6edf3]">TechCrunch</span> —{" "}
                    <span className="text-[#3b82f6]">techcrunch.com/feed/</span>
                  </li>
                  <li>
                    <span className="text-[#e6edf3]">The Guardian</span> —{" "}
                    <span className="text-[#3b82f6]">
                      theguardian.com/
                    </span>{" "}
                    (Technology, US News, Business, Environment)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  Sentiment Scoring
                </h3>
                <p>
                  Each headline and summary is scored using keyword-based natural
                  language processing. The algorithm maintains curated lexicons
                  of ~100 positive terms (e.g., &quot;breakthrough,&quot;
                  &quot;growth,&quot; &quot;innovative&quot;) and ~100 negative
                  terms (e.g., &quot;crisis,&quot; &quot;scandal,&quot;
                  &quot;plummets&quot;). The sentiment score is calculated as:
                </p>
                <div className="bg-[#161b22] rounded-lg p-3 mt-2 text-[#e6edf3] text-xs">
                  score = (positive_matches - negative_matches) / max(total_matches, 3)
                </div>
                <p className="mt-2">
                  Scores range from -1.0 (maximally negative) to +1.0
                  (maximally positive). Articles with no matched keywords score
                  near 0 (neutral). Multi-word phrases receive double weight.
                </p>
              </div>

              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  BS Score (Sensationalism Index)
                </h3>
                <p>
                  The BS Score (0–100) measures how sensationalized an article&apos;s
                  framing is, independent of whether the content is positive or
                  negative. It combines:
                </p>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>
                    <span className="text-[#e6edf3]">
                      Charged language density
                    </span>{" "}
                    — count of loaded terms × 15 (from a curated list of ~300
                    terms like &quot;slammed,&quot; &quot;game-changing,&quot;
                    &quot;unprecedented&quot;)
                  </li>
                  <li>
                    <span className="text-[#e6edf3]">Sentiment extremity</span>{" "}
                    — |score| × 30 (the further from neutral, the higher the
                    penalty)
                  </li>
                  <li>
                    <span className="text-[#e6edf3]">Clickbait patterns</span>{" "}
                    — +20 for question headlines, exclamation marks,
                    &quot;you won&apos;t believe,&quot; &quot;here&apos;s why&quot;
                  </li>
                  <li>
                    <span className="text-[#e6edf3]">ALL CAPS words</span> — +10
                    per word with 3+ consecutive capitals
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  Topic Detection
                </h3>
                <p>
                  Articles are tagged with topics based on keyword matching
                  against 8 categories: tech, AI, regulation, founder/CEO
                  coverage, politics, economy, security, and climate. Each
                  category has 10–20 associated keywords. An article can match
                  multiple topics.
                </p>
              </div>

              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  Limitations & Caveats
                </h3>
                <ul className="space-y-1.5 ml-4 list-disc">
                  <li>
                    RSS feeds typically contain 2–4 weeks of recent articles.
                    Historical depth comes from GDELT, which may have gaps.
                  </li>
                  <li>
                    Keyword-based sentiment analysis cannot detect sarcasm, irony,
                    or nuanced framing. A headline about &quot;regulation fears&quot; may
                    be reporting on others&apos; fears, not expressing fear itself.
                  </li>
                  <li>
                    The BS Score measures framing intensity, not factual accuracy.
                    A high BS score means sensationalized language — the
                    underlying reporting may still be accurate.
                  </li>
                  <li>
                    Article volume differs across outlets. Outlets with fewer
                    articles in our dataset have less statistically reliable
                    averages.
                  </li>
                  <li>
                    GDELT-sourced articles may lack summaries, resulting in
                    lower-confidence sentiment scores for those entries.
                  </li>
                  <li>
                    This tool measures <em className="text-[#e6edf3]">tone and framing</em>, not
                    political bias, factual accuracy, or editorial intent.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  Open Source & Verification
                </h3>
                <p>
                  The complete source code, data collection scripts, and scoring
                  algorithms are available on{" "}
                  <a
                    href="https://github.com/TraceCohenTech/Media-Bias"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b82f6] hover:underline"
                  >
                    GitHub
                  </a>
                  . All RSS feed URLs are public endpoints. GDELT data is freely
                  available at{" "}
                  <a
                    href="https://www.gdeltproject.org/api/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b82f6] hover:underline"
                  >
                    gdeltproject.org/api
                  </a>
                  . You can run the data collection yourself to verify results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="pt-6 border-t border-[#1a2332] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7d8590] font-mono">
          <span>Media Bias Sentiment Monitor</span>
          <div className="flex items-center gap-4">
            <a href="#methodology" className="hover:text-[#e6edf3] transition-colors">
              Methodology
            </a>
            <a
              href="https://github.com/TraceCohenTech/Media-Bias"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#e6edf3] transition-colors"
            >
              GitHub
            </a>
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
