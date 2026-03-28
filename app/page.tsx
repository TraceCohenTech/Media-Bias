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
  delay = "delay-100",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  delay?: string;
}) {
  return (
    <section className={`mb-16 sm:mb-20 animate-fade-in-up ${delay}`}>
      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e]">
          {title}
        </h2>
        <p className="text-[#64748b] text-sm sm:text-base mt-2 leading-relaxed max-w-3xl">
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-[#1a1a2e] text-base font-medium">
            Loading analysis...
          </div>
          <div className="text-[#94a3b8] text-sm mt-1">
            1,200+ articles across 17 outlets
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600">Failed to load data.</div>
      </div>
    );
  }

  const sorted = [...(data.biasScores || [])].sort(
    (a: any, b: any) => b.bias_score - a.bias_score
  );
  const mostPositive = sorted[0];
  const mostNegative = sorted[sorted.length - 1];

  return (
    <main className="min-h-screen bg-white text-[#1a1a2e]">
      {/* ═══════ HERO ═══════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#f8fafc] via-white to-[#eff6ff]">
        {/* Subtle animated background dots */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #2563eb 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 relative">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-blue-700">
                Live Analysis
              </span>
            </div>
          </div>

          <h1 className="animate-fade-in-up delay-100">
            <span className="block text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1a1a2e] leading-[1.1]">
              How Media Covers
            </span>
            <span className="block text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mt-1 gradient-text">
              Tech & Startups
            </span>
          </h1>

          <p className="animate-fade-in-up delay-200 text-lg sm:text-xl text-[#64748b] mt-5 sm:mt-6 max-w-2xl leading-relaxed">
            Sentiment analysis of{" "}
            <span className="text-[#1a1a2e] font-semibold">
              {data.total_articles.toLocaleString()} articles
            </span>{" "}
            across{" "}
            <span className="text-[#1a1a2e] font-semibold">17 major outlets</span>.
            Every headline scored for sentiment, sensationalism, and charged language.
          </p>

          {/* Key findings */}
          {mostPositive && mostNegative && (
            <div className="animate-fade-in-up delay-300 mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-600 mb-0.5">Most positive on tech</div>
                <div className="text-base sm:text-lg font-bold text-emerald-700">
                  {mostPositive.outlet}{" "}
                  <span className="font-mono text-sm">
                    ({mostPositive.bias_score > 0 ? "+" : ""}{mostPositive.bias_score.toFixed(3)})
                  </span>
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                <div className="text-xs font-medium text-red-600 mb-0.5">Most negative on tech</div>
                <div className="text-base sm:text-lg font-bold text-red-700">
                  {mostNegative.outlet}{" "}
                  <span className="font-mono text-sm">
                    ({mostNegative.bias_score.toFixed(3)})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="animate-fade-in-up delay-400 mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { value: data.total_articles.toLocaleString(), label: "Articles Analyzed", color: "text-blue-600" },
              { value: data.biasScores?.length || 0, label: "Outlets Tracked", color: "text-[#1a1a2e]" },
              { value: data.authorStats?.length || 0, label: "Writers Profiled", color: "text-amber-600" },
              { value: data.topBsArticles?.[0]?.bs_score || 0, label: "Peak BS Score", color: "text-red-600" },
            ].map((stat, i) => (
              <div key={i} className={`animate-count-up delay-${(i + 4) * 100}`}>
                <div className={`text-3xl sm:text-4xl font-extrabold font-mono ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-[#94a3b8] font-medium mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Coverage overview */}
        <div className="animate-fade-in-up mb-16 sm:mb-20 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CoverageDonut data={data.biasScores || []} total={data.total_articles} />
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-5 sm:p-6">
            <div className="text-sm font-semibold text-[#1a1a2e] mb-3">Data Sources</div>
            <div className="space-y-2.5 text-sm">
              {[
                { dot: "bg-emerald-500", label: "RSS Feeds", detail: "24 endpoints across 17 outlets" },
                { dot: "bg-blue-500", label: "GDELT Project", detail: "120-day open news archive" },
                { dot: "bg-amber-500", label: "NLP Scoring", detail: "300+ sentiment & bias keywords" },
              ].map((src) => (
                <div key={src.label} className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${src.dot} flex-shrink-0`} />
                  <span className="text-[#1a1a2e] font-medium">{src.label}</span>
                  <span className="text-[#94a3b8]">{src.detail}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[#e2e8f0] text-xs text-[#94a3b8]">
              Updated{" "}
              {new Date(data.generated_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Sections */}
        <Section
          title="Sentiment Breakdown by Outlet"
          description="What percentage of each outlet's tech coverage is positive, neutral, or negative? Green = favorable framing. Red = critical framing. Outlets are ranked by total article volume."
          delay="delay-100"
        >
          <SentimentScatter data={scatterData} />
        </Section>

        <Section
          title="Outlet Fingerprints"
          description="Each outlet covers tech differently. The radar maps sentiment across 8 topics for the top outlets by volume. The rankings show overall lean and sensationalism for all 17."
          delay="delay-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <OutletRadar data={data.heatmap || {}} />
            <OutletRankings data={data.biasScores || []} />
          </div>
        </Section>

        <Section
          title="Topic Deep Dive"
          description="How does each outlet cover specific tech topics? Red = negative framing, blue = neutral, green = positive. The number shows average sentiment score for that outlet-topic pair."
          delay="delay-100"
        >
          <BiasHeatmap data={data.heatmap || {}} />
        </Section>

        <Section
          title="BS Detector"
          description={"Every headline scored 0\u2013100 for sensationalism. Clean = straight reporting. Low = slight editorializing. Moderate = opinionated framing. High = heavy charged language and clickbait."}
          delay="delay-100"
        >
          <BSDetector data={data.topBsArticles || []} allArticles={scatterData} />
        </Section>

        <Section
          title="Charged Language"
          description={"Words designed to trigger emotional reactions \u2014 \u201Cslammed,\u201D \u201Cgame-changing,\u201D \u201Cunprecedented.\u201D We track ~300 such terms. Ranked by frequency per outlet."}
          delay="delay-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ChargedTerms data={data.chargedTerms || {}} />
            <WordTrends data={data.wordTrends || []} />
          </div>
        </Section>

        <Section
          title="Writer Analysis"
          description={"Individual writers have patterns too. Authors with 2+ articles ranked by BS score. High BS + negative sentiment often means opinion dressed as news."}
          delay="delay-100"
        >
          <AuthorAnalysis data={data.authorStats || []} />
        </Section>

        <Section
          title="All Analyzed Articles"
          description="Every article in the dataset with sentiment and BS scores. All pre-filtered to tech, AI, startups, VCs, founders, and big tech coverage."
          delay="delay-100"
        >
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 sm:p-6">
            {/* Mobile cards */}
            <div className="lg:hidden space-y-2">
              {(data.recentArticles || []).slice(0, 50).map((article: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-white border border-[#e2e8f0]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-blue-600">{article.outlet}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: article.sentiment_score > 0.1 ? "#059669" : article.sentiment_score < -0.1 ? "#dc2626" : "#2563eb",
                          backgroundColor: article.sentiment_score > 0.1 ? "#ecfdf5" : article.sentiment_score < -0.1 ? "#fef2f2" : "#eff6ff",
                        }}
                      >
                        {article.sentiment_score > 0 ? "+" : ""}{article.sentiment_score?.toFixed(2)}
                      </span>
                      <span className="text-xs font-mono font-semibold" style={{ color: article.bs_score >= 20 ? "#d97706" : article.bs_score >= 10 ? "#2563eb" : "#059669" }}>
                        BS:{article.bs_score || 0}
                      </span>
                    </div>
                  </div>
                  <div className="text-[#1a1a2e] text-sm leading-snug">{article.headline}</div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#94a3b8]">
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
                  <tr className="text-[#94a3b8] text-xs font-medium border-b border-[#e2e8f0]">
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
                    <tr key={i} className="border-t border-[#f1f5f9] hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 pr-3 text-[#1a1a2e] text-xs font-semibold whitespace-nowrap">{article.outlet}</td>
                      <td className="py-2.5 pr-3 text-[#94a3b8] text-xs whitespace-nowrap">{article.date}</td>
                      <td className="py-2.5 pr-3 text-sm text-[#1a1a2e] max-w-md"><span className="line-clamp-2">{article.headline}</span></td>
                      <td className="py-2.5 pr-3 text-[#94a3b8] text-xs whitespace-nowrap max-w-[120px] truncate">{article.author || "\u2014"}</td>
                      <td className="py-2.5 pr-3 text-center">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold"
                          style={{
                            color: article.sentiment_score > 0.1 ? "#059669" : article.sentiment_score < -0.1 ? "#dc2626" : "#2563eb",
                            backgroundColor: article.sentiment_score > 0.1 ? "#ecfdf5" : article.sentiment_score < -0.1 ? "#fef2f2" : "#eff6ff",
                          }}
                        >
                          {article.sentiment_score > 0 ? "+" : ""}{article.sentiment_score?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="text-xs font-mono font-semibold" style={{ color: article.bs_score >= 20 ? "#d97706" : article.bs_score >= 10 ? "#2563eb" : "#059669" }}>
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
        <section className="mb-12 sm:mb-16 animate-fade-in" id="methodology">
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-5 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-6">
              Methodology & Data Sources
            </h2>
            <div className="space-y-6 text-sm sm:text-base text-[#64748b] leading-relaxed">
              <div>
                <h3 className="text-[#1a1a2e] font-semibold mb-2">Data Collection</h3>
                <p>Articles are collected from public RSS feeds (Technology and Business sections) and the <a href="https://www.gdeltproject.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GDELT Project</a> open database. Every article must match tech/startup/VC keywords to be included. Non-tech content is filtered out via exclusion lists.</p>
              </div>
              <div>
                <h3 className="text-[#1a1a2e] font-semibold mb-2">Sentiment Scoring (-1.0 to +1.0)</h3>
                <p>Headlines and summaries scored using curated lexicons of ~100 positive terms and ~100 negative terms. Multi-word phrases receive double weight.</p>
                <div className="bg-white rounded-lg border border-[#e2e8f0] p-3 mt-2 font-mono text-sm text-[#1a1a2e]">
                  score = (positive_matches - negative_matches) / max(total_matches, 3)
                </div>
              </div>
              <div>
                <h3 className="text-[#1a1a2e] font-semibold mb-2">BS Score (0-100)</h3>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><span className="text-[#1a1a2e] font-medium">Charged language</span> {"\u2014"} count of loaded terms {"\u00D7"} 15</li>
                  <li><span className="text-[#1a1a2e] font-medium">Sentiment extremity</span> {"\u2014"} |score| {"\u00D7"} 30</li>
                  <li><span className="text-[#1a1a2e] font-medium">Clickbait patterns</span> {"\u2014"} +20 for question headlines, exclamation marks</li>
                  <li><span className="text-[#1a1a2e] font-medium">ALL CAPS</span> {"\u2014"} +10 per word with 3+ consecutive capitals</li>
                </ul>
              </div>
              <div>
                <h3 className="text-[#1a1a2e] font-semibold mb-2">Limitations</h3>
                <ul className="space-y-1.5 ml-4 list-disc">
                  <li>Keyword sentiment cannot detect sarcasm, irony, or nuanced framing.</li>
                  <li>BS Score measures framing intensity, not factual accuracy.</li>
                  <li>Article volume varies by outlet, affecting statistical reliability of smaller samples.</li>
                  <li>This measures <em className="text-[#1a1a2e] font-medium">tone and framing</em>, not political bias or editorial intent.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer className="pt-6 pb-8 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#94a3b8]">
          <span>Media Bias Sentiment Monitor</span>
          <div className="flex items-center gap-5">
            <a href="#methodology" className="hover:text-[#1a1a2e] transition-colors">Methodology</a>
<a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a2e] transition-colors">Twitter</a>
            <a href="mailto:t@nyvp.com" className="hover:text-[#1a1a2e] transition-colors">t@nyvp.com</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
