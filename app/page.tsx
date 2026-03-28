"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import BiasHeatmap from "@/components/BiasHeatmap";
import ChargedTerms from "@/components/ChargedTerms";
import BSDetector from "@/components/BSDetector";
import AuthorAnalysis from "@/components/AuthorAnalysis";
import CoverageDonut from "@/components/CoverageDonut";

const SentimentScatter = dynamic(
  () => import("@/components/SentimentScatter"),
  { ssr: false }
);
const OutletRadar = dynamic(() => import("@/components/OutletRadar"), {
  ssr: false,
});
const OutletRankings = dynamic(() => import("@/components/OutletRankings"), {
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

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 sm:mb-16">
      <div className="mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-[#e6edf3] font-mono">
          {title}
        </h2>
        <p className="text-[#7d8590] text-xs sm:text-sm mt-1 font-mono leading-relaxed max-w-3xl">
          {description}
        </p>
      </div>
      {children}
    </section>
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

  // Prepare scatter data from recent articles
  const scatterData = useMemo(() => {
    if (!data?.recentArticles) return [];
    return data.recentArticles.map((a: any) => ({
      outlet: a.outlet,
      headline: a.headline,
      sentiment_score: a.sentiment_score,
      bs_score: a.bs_score || 0,
      author: a.author,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#3b82f6] font-mono text-lg animate-pulse mb-2">
            Loading analysis...
          </div>
          <div className="text-[#7d8590] font-mono text-xs">
            304+ tech articles across 6 outlets
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
        <div className="text-[#ef4444] font-mono">Failed to load data.</div>
      </div>
    );
  }

  // Find most positive and most negative outlets
  const sorted = [...(data.biasScores || [])].sort(
    (a: any, b: any) => b.bias_score - a.bias_score
  );
  const mostPositive = sorted[0];
  const mostNegative = sorted[sorted.length - 1];

  return (
    <main className="min-h-screen bg-[#080b12] text-[#e6edf3]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {/* ═══════ HERO ═══════ */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-start gap-2 mb-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-[#3b82f6] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono text-[#3b82f6] tracking-wider uppercase">
              Live Analysis
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight font-mono leading-tight">
            <span className="text-[#e6edf3]">How Media Covers</span>
            <br />
            <span className="text-[#3b82f6]">Tech & Startups</span>
          </h1>
          <p className="text-[#7d8590] text-sm sm:text-base mt-3 font-mono leading-relaxed max-w-2xl">
            Sentiment analysis of{" "}
            <span className="text-[#e6edf3] font-semibold">
              {data.total_articles} articles
            </span>{" "}
            across NYT, WSJ, Wired, The Atlantic, TechCrunch, and The Guardian.
            Every headline scored for bias, sensationalism, and charged language.
          </p>

          {/* Key finding callout */}
          {mostPositive && mostNegative && (
            <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="px-3 py-2 rounded-lg bg-[#22c55e08] border border-[#22c55e20]">
                <span className="text-[10px] sm:text-xs font-mono text-[#22c55e]">
                  Most positive on tech:{" "}
                  <span className="font-semibold">
                    {mostPositive.outlet}
                  </span>{" "}
                  ({mostPositive.bias_score > 0 ? "+" : ""}
                  {mostPositive.bias_score.toFixed(3)})
                </span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-[#ef444408] border border-[#ef444420]">
                <span className="text-[10px] sm:text-xs font-mono text-[#ef4444]">
                  Most negative on tech:{" "}
                  <span className="font-semibold">
                    {mostNegative.outlet}
                  </span>{" "}
                  ({mostNegative.bias_score.toFixed(3)})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ═══════ STATS + DONUT ═══════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12 sm:mb-16">
          <CoverageDonut
            data={data.biasScores || []}
            total={data.total_articles}
          />
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-4 flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#3b82f6] font-mono">
                {data.biasScores?.length || 0}
              </div>
              <div className="text-[10px] sm:text-xs text-[#7d8590] font-mono">
                Outlets Tracked
              </div>
            </div>
            <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-4 flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#f59e0b] font-mono">
                {data.authorStats?.length || 0}
              </div>
              <div className="text-[10px] sm:text-xs text-[#7d8590] font-mono">
                Writers Profiled
              </div>
            </div>
            <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-4 flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#ef4444] font-mono">
                {data.topBsArticles?.[0]?.bs_score || 0}
              </div>
              <div className="text-[10px] sm:text-xs text-[#7d8590] font-mono">
                Peak BS Score
              </div>
            </div>
            <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-4 flex flex-col justify-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#22c55e] font-mono">
                8
              </div>
              <div className="text-[10px] sm:text-xs text-[#7d8590] font-mono">
                Topic Categories
              </div>
            </div>
          </div>
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-4">
            <div className="text-xs font-mono text-[#7d8590] mb-2">Data Sources</div>
            <div className="space-y-1.5 text-[10px] sm:text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span className="text-[#e6edf3]">RSS Feeds</span>
                <span className="text-[#7d8590]">12 endpoints</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                <span className="text-[#e6edf3]">GDELT Project</span>
                <span className="text-[#7d8590]">120-day archive</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                <span className="text-[#e6edf3]">NLP Scoring</span>
                <span className="text-[#7d8590]">300+ keywords</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-[#1a2332] text-[10px] font-mono text-[#7d8590]">
              Updated{" "}
              {new Date(data.generated_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* ═══════ 1. THE LANDSCAPE — Scatter Plot ═══════ */}
        <Section
          title="Sentiment Breakdown by Outlet"
          description="What percentage of each outlet's tech coverage is positive, neutral, or negative? Wider green bars = more favorable tech coverage. Wider red bars = more critical framing."
        >
          <SentimentScatter data={scatterData} />
        </Section>

        {/* ═══════ 2. OUTLET FINGERPRINTS — Radar + Rankings ═══════ */}
        <Section
          title="Outlet Fingerprints"
          description="Each outlet has a unique coverage profile. The radar shows how sentiment varies by topic — an outlet might be bullish on AI but hostile to crypto regulation. The rankings show overall lean and sensationalism level."
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <OutletRadar data={data.heatmap || {}} />
            <OutletRankings data={data.biasScores || []} />
          </div>
        </Section>

        {/* ═══════ 3. TOPIC DEEP DIVE — Heatmap ═══════ */}
        <Section
          title="Topic Deep Dive"
          description="How does each outlet cover specific tech topics? This heatmap shows average sentiment across AI/ML, startups, VC funding, big tech, CEO coverage, regulation, cybersecurity, and crypto. Red = negative framing, blue = neutral, green = positive."
        >
          <BiasHeatmap data={data.heatmap || {}} />
        </Section>

        {/* ═══════ 4. BS DETECTOR ═══════ */}
        <Section
          title="BS Detector"
          description={"Every headline scored 0\u2013100 for sensationalism. Clean = straight reporting. Low = slight editorializing. Moderate = clearly opinionated framing. High = heavy charged language and clickbait. See which articles triggered the highest scores and why."}
        >
          <BSDetector
            data={data.topBsArticles || []}
            allArticles={scatterData}
          />
        </Section>

        {/* ═══════ 5. CHARGED LANGUAGE ═══════ */}
        <Section
          title="Charged Language"
          description={"Words designed to trigger emotional reactions rather than inform \u2014 \u201Cslammed,\u201D \u201Cgame-changing,\u201D \u201Cunprecedented,\u201D \u201Cdisruption.\u201D We track ~300 such terms. The ranked lists show each outlet\u2019s most-used charged words."}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ChargedTerms data={data.chargedTerms || {}} />
            <WordTrends data={data.wordTrends || []} />
          </div>
        </Section>

        {/* ═══════ 6. WRITERS ═══════ */}
        <Section
          title="Writer Analysis"
          description={"Bias isn\u2019t just institutional \u2014 individual writers have patterns. Authors with 2+ articles ranked by BS score. High BS + negative sentiment often means opinion dressed as news."}
        >
          <AuthorAnalysis data={data.authorStats || []} />
        </Section>

        {/* ═══════ 7. ARTICLE FEED ═══════ */}
        <Section
          title="All Analyzed Articles"
          description="Every article in the dataset with scores. All pre-filtered to tech, AI, startups, VCs, founders, and big tech coverage."
        >
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 sm:p-6">
            {/* Mobile cards */}
            <div className="lg:hidden space-y-2">
              {(data.recentArticles || []).slice(0, 50).map((article: any, i: number) => (
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
                            article.bs_score >= 20
                              ? "#f59e0b"
                              : article.bs_score >= 10
                              ? "#3b82f6"
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
            {/* Desktop table */}
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
                  {(data.recentArticles || []).map((article: any, i: number) => (
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
                        {article.author || "\u2014"}
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
                              article.bs_score >= 20
                                ? "#f59e0b"
                                : article.bs_score >= 10
                                ? "#3b82f6"
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
          </div>
        </Section>

        {/* ═══════ METHODOLOGY ═══════ */}
        <section className="mb-10 sm:mb-14" id="methodology">
          <div className="bg-[#0d1117] border border-[#1a2332] rounded-xl p-4 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-[#e6edf3] font-mono mb-4">
              Methodology & Data Sources
            </h2>
            <div className="space-y-5 text-xs sm:text-sm font-mono text-[#7d8590] leading-relaxed">
              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  Data Collection
                </h3>
                <p>
                  Articles are collected from public RSS feeds (Technology and Business sections only) and the{" "}
                  <a href="https://www.gdeltproject.org/" target="_blank" rel="noopener noreferrer" className="text-[#3b82f6] hover:underline">GDELT Project</a>{" "}
                  open database. Every article must match at least one of 70+ tech/startup/VC keywords to be included. Non-tech content (politics, climate, war, sports) is filtered out.
                </p>
              </div>

              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  Sentiment Scoring (-1.0 to +1.0)
                </h3>
                <p>Headlines and summaries are scored using curated lexicons of ~100 positive terms (breakthrough, funding, innovative) and ~100 negative terms (layoffs, scandal, plummets). Multi-word phrases receive double weight.</p>
                <div className="bg-[#161b22] rounded-lg p-3 mt-2 text-[#e6edf3] text-xs">
                  score = (positive_matches - negative_matches) / max(total_matches, 3)
                </div>
              </div>

              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  BS Score (0-100)
                </h3>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><span className="text-[#e6edf3]">Charged language</span> {"\u2014"} count of loaded terms {"\u00D7"} 15</li>
                  <li><span className="text-[#e6edf3]">Sentiment extremity</span> {"\u2014"} |score| {"\u00D7"} 30</li>
                  <li><span className="text-[#e6edf3]">Clickbait patterns</span> {"\u2014"} +20 for question headlines, exclamation marks</li>
                  <li><span className="text-[#e6edf3]">ALL CAPS</span> {"\u2014"} +10 per word with 3+ consecutive capitals</li>
                </ul>
              </div>

              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  Topic Categories
                </h3>
                <p>8 tech-focused categories: AI/ML, Startups/Founders, VC/Funding, Big Tech, CEO/Billionaire, Regulation/Antitrust, Cybersecurity, Crypto/Web3. Each has 10-20 keywords. Articles can match multiple topics.</p>
              </div>

              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  Limitations
                </h3>
                <ul className="space-y-1.5 ml-4 list-disc">
                  <li>Keyword sentiment cannot detect sarcasm, irony, or nuanced framing.</li>
                  <li>BS Score measures framing intensity, not factual accuracy. High BS does not mean the article is wrong.</li>
                  <li>RSS feeds hold ~2 weeks of articles. Historical depth depends on GDELT availability.</li>
                  <li>Article volume varies by outlet, affecting statistical reliability of smaller samples.</li>
                  <li>This measures <em className="text-[#e6edf3]">tone and framing</em>, not political bias or editorial intent.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-[#e6edf3] font-semibold mb-2">
                  Open Source
                </h3>
                <p>
                  Full source code, data scripts, and scoring algorithms:{" "}
                  <a href="https://github.com/TraceCohenTech/Media-Bias" target="_blank" rel="noopener noreferrer" className="text-[#3b82f6] hover:underline">github.com/TraceCohenTech/Media-Bias</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer className="pt-6 border-t border-[#1a2332] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7d8590] font-mono">
          <span>Media Bias Sentiment Monitor</span>
          <div className="flex items-center gap-4">
            <a href="#methodology" className="hover:text-[#e6edf3] transition-colors">Methodology</a>
            <a href="https://github.com/TraceCohenTech/Media-Bias" target="_blank" rel="noopener noreferrer" className="hover:text-[#e6edf3] transition-colors">GitHub</a>
            <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer" className="hover:text-[#e6edf3] transition-colors">Twitter</a>
            <a href="mailto:t@nyvp.com" className="hover:text-[#e6edf3] transition-colors">t@nyvp.com</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
