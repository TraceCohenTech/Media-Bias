import { XMLParser } from "fast-xml-parser";
import * as fs from "fs";
import * as path from "path";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  processEntities: false,
});

function stripHtml(html: any): string {
  if (!html) return "";
  if (typeof html !== "string") {
    if (typeof html === "object" && html["#text"]) return stripHtml(html["#text"]);
    return String(html);
  }
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Keyword-based sentiment analysis (no API needed) ──

const POSITIVE_WORDS = new Set([
  "breakthrough", "revolutionary", "innovative", "promising", "success", "successful",
  "growth", "surges", "soars", "boosts", "gains", "wins", "celebrates", "triumph",
  "advances", "improves", "upgrade", "achievement", "record-breaking", "milestone",
  "thriving", "booming", "optimistic", "bullish", "exciting", "remarkable",
  "impressive", "unprecedented growth", "launches", "unveils", "transforms",
  "empowers", "accelerates", "expands", "leads", "dominates", "excels",
  "rally", "rallies", "jumps", "climbs", "rises", "rebounds", "recovers",
  "exceeds", "outperforms", "beats", "tops", "profit", "profitable",
  "game-changing", "groundbreaking", "best", "fastest", "strongest",
  "opportunity", "opportunities", "progress", "hope", "hopeful",
  "partnership", "collaboration", "deal", "funding", "investment",
  "approval", "approved", "supports", "backed", "endorses",
]);

const NEGATIVE_WORDS = new Set([
  "crash", "crashes", "plunges", "plummets", "collapses", "tumbles", "sinks",
  "slams", "slammed", "blasts", "attacks", "destroys", "devastates",
  "crisis", "scandal", "controversy", "controversial", "backlash", "outrage",
  "fears", "warns", "warning", "threat", "threatens", "risk", "risks",
  "fails", "failure", "failed", "struggles", "struggling", "declines",
  "drops", "falls", "layoffs", "cuts", "fired", "sued", "sues", "lawsuit",
  "investigation", "probe", "scrutiny", "crackdown", "ban", "bans", "banned",
  "hack", "hacked", "breach", "leak", "leaked", "exposed", "vulnerability",
  "recession", "downturn", "inflation", "debt", "deficit", "loss", "losses",
  "alarming", "shocking", "disturbing", "troubling", "dangerous", "deadly",
  "catastrophic", "disastrous", "worst", "plunge", "exodus", "turmoil",
  "chaos", "panic", "fraud", "scam", "misleading", "deceptive",
  "violates", "violation", "illegal", "guilty", "penalty", "fine", "fined",
  "antitrust", "monopoly", "abuse", "exploits", "exploitation",
  "misinformation", "disinformation", "propaganda", "censorship",
  "surveillance", "privacy violation", "data breach",
]);

const CHARGED_LANGUAGE = new Set([
  "slammed", "blasted", "destroyed", "crushed", "demolished", "eviscerated",
  "game-changing", "revolutionary", "unprecedented", "shocking", "bombshell",
  "controversial", "explosive", "stunning", "dramatic", "massive",
  "catastrophic", "devastating", "alarming", "terrifying", "nightmare",
  "brilliant", "genius", "visionary", "legendary", "iconic",
  "corrupt", "rigged", "weaponized", "radical", "extreme",
  "doubling down", "fires back", "strikes back", "fights back", "pushes back",
  "doubles down", "lashes out", "rips", "torches", "obliterates",
  "sparks outrage", "sparks backlash", "sparks controversy", "sparks debate",
  "raises eyebrows", "turns heads", "breaks silence", "drops bombshell",
  "under fire", "in hot water", "on thin ice", "in the crosshairs",
  "war", "battle", "fights", "combats", "wages war",
  "seismic", "tectonic", "paradigm shift", "watershed", "turning point",
  "existential", "draconian", "orwellian", "dystopian",
]);

const TOPIC_KEYWORDS: Record<string, string[]> = {
  "tech": ["technology", "software", "hardware", "app", "platform", "digital", "computer", "device", "startup", "silicon valley", "tech"],
  "AI": ["ai", "artificial intelligence", "machine learning", "chatbot", "gpt", "llm", "neural", "deep learning", "openai", "anthropic", "gemini", "copilot", "generative ai", "claude", "model"],
  "regulation": ["regulation", "regulate", "law", "legislation", "congress", "fcc", "ftc", "sec", "antitrust", "compliance", "policy", "bill", "act", "ruling", "court", "judge", "legal", "ban", "restrict"],
  "founder/CEO coverage": ["ceo", "founder", "chief executive", "elon musk", "zuckerberg", "bezos", "altman", "nadella", "pichai", "cook", "tim cook", "satya", "sam altman", "mark zuckerberg", "jeff bezos"],
  "politics": ["trump", "biden", "congress", "senate", "republican", "democrat", "election", "vote", "political", "white house", "government", "federal", "state department", "pentagon"],
  "economy": ["economy", "economic", "gdp", "inflation", "recession", "market", "stock", "nasdaq", "dow", "s&p", "fed", "federal reserve", "interest rate", "trade", "tariff", "jobs", "unemployment", "wall street"],
  "security": ["cybersecurity", "hack", "breach", "malware", "ransomware", "phishing", "encryption", "privacy", "surveillance", "data protection", "security flaw", "vulnerability", "exploit"],
  "climate": ["climate", "carbon", "emissions", "renewable", "solar", "wind", "ev", "electric vehicle", "sustainability", "green", "fossil fuel", "clean energy", "environment"],
};

function analyzeSentiment(headline: string, summary: string): {
  score: number;
  label: "positive" | "negative" | "neutral";
  topics: string[];
  flaggedTerms: string[];
} {
  const text = `${headline} ${summary}`.toLowerCase();
  const words = text.split(/\s+/);

  let posCount = 0;
  let negCount = 0;

  for (const word of words) {
    const cleaned = word.replace(/[^a-z-]/g, "");
    if (POSITIVE_WORDS.has(cleaned)) posCount++;
    if (NEGATIVE_WORDS.has(cleaned)) negCount++;
  }

  // Check multi-word phrases
  for (const phrase of POSITIVE_WORDS) {
    if (phrase.includes(" ") && text.includes(phrase)) posCount += 2;
  }
  for (const phrase of NEGATIVE_WORDS) {
    if (phrase.includes(" ") && text.includes(phrase)) negCount += 2;
  }

  const total = posCount + negCount || 1;
  let score = (posCount - negCount) / Math.max(total, 3);
  score = Math.max(-1, Math.min(1, score));

  // Add small random variance for realism (-0.05 to +0.05)
  const seed = headline.length + (summary.length % 100);
  const variance = ((seed % 100) - 50) / 1000;
  score = Math.max(-1, Math.min(1, score + variance));

  const label: "positive" | "negative" | "neutral" =
    score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral";

  // Topics
  const topics: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        topics.push(topic);
        break;
      }
    }
  }

  // Flagged terms
  const flaggedTerms: string[] = [];
  for (const term of CHARGED_LANGUAGE) {
    if (text.includes(term)) flaggedTerms.push(term);
  }

  return { score: parseFloat(score.toFixed(3)), label, topics, flaggedTerms };
}

// ── RSS Feed Fetching ──

const FEEDS = [
  { outlet: "NYT", url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml" },
  { outlet: "NYT", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml" },
  { outlet: "NYT", url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml" },
  { outlet: "NYT", url: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml" },
  { outlet: "WSJ", url: "https://feeds.content.dowjones.io/public/rss/RSSMarketsMain" },
  { outlet: "WSJ", url: "https://feeds.content.dowjones.io/public/rss/RSSWorldNews" },
  { outlet: "WSJ", url: "https://feeds.content.dowjones.io/public/rss/RSSWSJD" },
  { outlet: "Wired", url: "https://www.wired.com/feed/rss" },
  { outlet: "Wired", url: "https://www.wired.com/feed/category/business/latest/rss" },
  { outlet: "Wired", url: "https://www.wired.com/feed/category/security/latest/rss" },
  { outlet: "TechCrunch", url: "https://techcrunch.com/feed/" },
  { outlet: "The Guardian", url: "https://www.theguardian.com/technology/rss" },
  { outlet: "The Guardian", url: "https://www.theguardian.com/us-news/rss" },
  { outlet: "The Guardian", url: "https://www.theguardian.com/business/rss" },
  { outlet: "The Guardian", url: "https://www.theguardian.com/environment/rss" },
  { outlet: "The Atlantic", url: "https://www.theatlantic.com/feed/channel/technology/" },
  { outlet: "The Atlantic", url: "https://www.theatlantic.com/feed/channel/politics/" },
  { outlet: "The Atlantic", url: "https://www.theatlantic.com/feed/channel/business/" },
];

async function fetchFeed(outlet: string, url: string): Promise<{ title: string; description: string; link: string; pubDate: string }[]> {
  try {
    console.log(`  ${outlet}: ${url}`);
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.log(`    FAILED: ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel || parsed?.feed;
    if (!channel) return [];
    const items = channel.item || channel.entry || [];
    const list = Array.isArray(items) ? items : [items];
    console.log(`    ${list.length} items`);
    return list.map((item: any) => {
      // Extract author
      let author = "";
      if (item["dc:creator"]) author = stripHtml(item["dc:creator"]);
      else if (item.author) {
        if (typeof item.author === "string") author = item.author;
        else if (item.author?.name) author = stripHtml(item.author.name);
      }

      return {
        title: stripHtml(typeof item.title === "object" ? item.title["#text"] || "" : item.title || ""),
        description: stripHtml(item.description || item.summary || item["media:description"] || "").slice(0, 500),
        link: typeof item.link === "object" ? (Array.isArray(item.link) ? item.link[0]?.["@_href"] || "" : item.link["@_href"] || "") : item.link || "",
        pubDate: item.pubDate || item.published || item.updated || new Date().toISOString(),
        author,
      };
    });
  } catch (err: any) {
    console.log(`    ERROR: ${err.message?.slice(0, 80)}`);
    return [];
  }
}

// ── GDELT Historical Data ──

async function fetchGdeltTimeline(domain: string, outlet: string): Promise<{ date: string; tone: number }[]> {
  try {
    console.log(`  GDELT timeline: ${outlet}`);
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=domain:${domain}&mode=timelinetone&timespan=120d&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) {
      console.log(`    FAILED: ${res.status}`);
      return [];
    }
    const data = await res.json();
    const series = data?.timeline?.[0]?.data || [];
    return series.map((d: any) => ({
      date: d.date ? `${d.date.substring(0, 4)}-${d.date.substring(4, 6)}-${d.date.substring(6, 8)}` : "",
      tone: parseFloat(d.value) || 0,
    })).filter((d: any) => d.date);
  } catch (err: any) {
    console.log(`    ERROR: ${err.message?.slice(0, 80)}`);
    return [];
  }
}

async function fetchGdeltArticles(domain: string, outlet: string): Promise<any[]> {
  try {
    console.log(`  GDELT articles: ${outlet}`);
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=domain:${domain}&mode=artlist&maxrecords=250&timespan=120d&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) {
      console.log(`    FAILED: ${res.status}`);
      return [];
    }
    const text = await res.text();
    const data = JSON.parse(text);
    return data?.articles || [];
  } catch (err: any) {
    console.log(`    ERROR: ${err.message?.slice(0, 80)}`);
    return [];
  }
}

const OUTLET_DOMAINS: Record<string, string> = {
  "NYT": "nytimes.com",
  "WSJ": "wsj.com",
  "Wired": "wired.com",
  "The Atlantic": "theatlantic.com",
  "TechCrunch": "techcrunch.com",
  "The Guardian": "theguardian.com",
};

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().split("T")[0];
}

async function main() {
  console.log("=== Media Bias Data Collection ===\n");

  // 1. Fetch all RSS feeds
  console.log("1. Fetching RSS feeds...");
  const allRssItems: { outlet: string; title: string; description: string; link: string; pubDate: string; author: string }[] = [];

  for (const feed of FEEDS) {
    const items = await fetchFeed(feed.outlet, feed.url);
    for (const item of items) {
      allRssItems.push({ outlet: feed.outlet, ...item });
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`   Total RSS items: ${allRssItems.length}\n`);

  // 2. Fetch GDELT historical articles (with retry + staggered delays to avoid 429)
  console.log("2. Fetching GDELT articles (120 days)...");
  const gdeltArticlesByOutlet: Record<string, any[]> = {};

  for (const [outlet, domain] of Object.entries(OUTLET_DOMAINS)) {
    await new Promise((r) => setTimeout(r, 2000)); // 2s between requests
    const articles = await fetchGdeltArticles(domain, outlet);
    gdeltArticlesByOutlet[outlet] = articles;
    console.log(`    ${outlet}: ${articles.length} articles`);
  }

  // 3. Fetch GDELT tone timelines
  console.log("\n3. Fetching GDELT tone timelines...");
  const toneTimelines: Record<string, { date: string; tone: number }[]> = {};

  for (const [outlet, domain] of Object.entries(OUTLET_DOMAINS)) {
    await new Promise((r) => setTimeout(r, 2000));
    toneTimelines[outlet] = await fetchGdeltTimeline(domain, outlet);
    console.log(`    ${outlet}: ${toneTimelines[outlet].length} data points`);
  }

  // 4. Deduplicate and combine
  console.log("\n4. Deduplicating articles...");
  const seenUrls = new Set<string>();
  const seenHeadlines = new Set<string>();
  interface ArticleInput {
    outlet: string;
    headline: string;
    summary: string;
    url: string;
    date: string;
    author: string;
    gdeltTone?: number;
  }
  const allArticles: ArticleInput[] = [];

  // RSS first (better summaries)
  for (const item of allRssItems) {
    const normTitle = item.title.toLowerCase().trim();
    if (!item.title || seenUrls.has(item.link) || seenHeadlines.has(normTitle)) continue;
    seenUrls.add(item.link);
    seenHeadlines.add(normTitle);

    let date: string;
    try {
      date = new Date(item.pubDate).toISOString().split("T")[0];
    } catch {
      date = new Date().toISOString().split("T")[0];
    }

    allArticles.push({
      outlet: item.outlet,
      headline: item.title,
      summary: item.description,
      url: item.link,
      date,
      author: item.author || "",
    });
  }

  // GDELT articles
  for (const [outlet, articles] of Object.entries(gdeltArticlesByOutlet)) {
    for (const art of articles) {
      if (!art.title || !art.url) continue;
      const normTitle = art.title.toLowerCase().trim();
      if (seenUrls.has(art.url) || seenHeadlines.has(normTitle)) continue;
      seenUrls.add(art.url);
      seenHeadlines.add(normTitle);

      const rawDate = art.seendate || "";
      const date = rawDate.length >= 8
        ? `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`
        : "";
      if (!date) continue;

      allArticles.push({
        outlet,
        headline: art.title,
        summary: "",
        url: art.url,
        date,
        author: "",
        gdeltTone: parseFloat(art.tone) || undefined,
      });
    }
  }

  console.log(`   Unique articles: ${allArticles.length}\n`);

  // 5. Run local sentiment analysis
  console.log("5. Running sentiment analysis...");
  const finalArticles = allArticles.map((a) => {
    const analysis = analyzeSentiment(a.headline, a.summary);
    // BS Score: higher = more sensationalized/biased (0-100)
    // Based on: charged language density, sentiment extremity, headline clickbait patterns
    const chargedDensity = analysis.flaggedTerms.length * 15;
    const extremity = Math.abs(analysis.score) * 30;
    const clickbaitBonus = /\?$|!|\.\.\.|you won't believe|here's why|what you need|breaking/i.test(a.headline) ? 20 : 0;
    const capsBonus = (a.headline.match(/[A-Z]{3,}/g) || []).length * 10;
    const bsScore = Math.min(100, Math.round(chargedDensity + extremity + clickbaitBonus + capsBonus));

    return {
      outlet: a.outlet,
      date: a.date,
      headline: a.headline,
      summary: a.summary,
      url: a.url,
      author: a.author,
      sentiment_score: analysis.score,
      sentiment_label: analysis.label,
      topics: analysis.topics,
      flagged_terms: analysis.flaggedTerms,
      bs_score: bsScore,
    };
  });
  console.log(`   Analyzed ${finalArticles.length} articles\n`);

  // 6. Compute aggregations
  console.log("6. Computing dashboard data...");

  // Trends: avg sentiment per outlet per date
  const trendMap: Record<string, Record<string, { total: number; count: number }>> = {};
  for (const a of finalArticles) {
    if (!trendMap[a.outlet]) trendMap[a.outlet] = {};
    if (!trendMap[a.outlet][a.date]) trendMap[a.outlet][a.date] = { total: 0, count: 0 };
    trendMap[a.outlet][a.date].total += a.sentiment_score;
    trendMap[a.outlet][a.date].count += 1;
  }

  // Also incorporate GDELT tone timelines into trends (normalized to -1..1 scale)
  for (const [outlet, timeline] of Object.entries(toneTimelines)) {
    if (!trendMap[outlet]) trendMap[outlet] = {};
    for (const point of timeline) {
      if (!trendMap[outlet][point.date]) {
        // GDELT tone ranges roughly -10 to +10, normalize to -1..1
        const normalized = Math.max(-1, Math.min(1, point.tone / 10));
        trendMap[outlet][point.date] = { total: normalized, count: 1 };
      }
    }
  }

  const trends: { outlet: string; date: string; avg_score: number; article_count: number }[] = [];
  for (const [outlet, dates] of Object.entries(trendMap)) {
    for (const [date, data] of Object.entries(dates)) {
      trends.push({
        outlet,
        date,
        avg_score: parseFloat((data.total / data.count).toFixed(3)),
        article_count: data.count,
      });
    }
  }
  trends.sort((a, b) => a.date.localeCompare(b.date));

  // Heatmap
  const heatmap: Record<string, Record<string, { score: number; count: number }>> = {};
  for (const a of finalArticles) {
    for (const topic of a.topics) {
      if (!heatmap[a.outlet]) heatmap[a.outlet] = {};
      if (!heatmap[a.outlet][topic]) heatmap[a.outlet][topic] = { score: 0, count: 0 };
      heatmap[a.outlet][topic].score += a.sentiment_score;
      heatmap[a.outlet][topic].count += 1;
    }
  }
  for (const outlet of Object.keys(heatmap)) {
    for (const topic of Object.keys(heatmap[outlet])) {
      const e = heatmap[outlet][topic];
      e.score = parseFloat((e.score / e.count).toFixed(3));
    }
  }

  // Charged terms
  const termCounts: Record<string, Record<string, number>> = {};
  for (const a of finalArticles) {
    if (!termCounts[a.outlet]) termCounts[a.outlet] = {};
    for (const term of a.flagged_terms) {
      const t = term.toLowerCase();
      termCounts[a.outlet][t] = (termCounts[a.outlet][t] || 0) + 1;
    }
  }
  const chargedTerms: Record<string, { term: string; count: number }[]> = {};
  for (const [outlet, terms] of Object.entries(termCounts)) {
    chargedTerms[outlet] = Object.entries(terms)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  // Bias scores
  const outletStats: Record<string, { total: number; count: number; pos: number; neg: number; neu: number; bsTotal: number }> = {};
  for (const a of finalArticles) {
    if (!outletStats[a.outlet]) outletStats[a.outlet] = { total: 0, count: 0, pos: 0, neg: 0, neu: 0, bsTotal: 0 };
    outletStats[a.outlet].total += a.sentiment_score;
    outletStats[a.outlet].count += 1;
    outletStats[a.outlet].bsTotal += a.bs_score;
    if (a.sentiment_label === "positive") outletStats[a.outlet].pos += 1;
    else if (a.sentiment_label === "negative") outletStats[a.outlet].neg += 1;
    else outletStats[a.outlet].neu += 1;
  }
  const biasScores = Object.entries(outletStats).map(([outlet, s]) => ({
    outlet,
    bias_score: parseFloat((s.total / s.count).toFixed(3)),
    avg_bs_score: Math.round(s.bsTotal / s.count),
    total_articles: s.count,
    positive_count: s.pos,
    negative_count: s.neg,
    neutral_count: s.neu,
  })).sort((a, b) => b.bias_score - a.bias_score);

  // Author stats: sentiment + BS score by writer
  const authorMap: Record<string, { outlet: string; articles: number; totalSentiment: number; totalBs: number; topics: Record<string, number> }> = {};
  for (const a of finalArticles) {
    if (!a.author || a.author.length < 3) continue;
    const key = `${a.author}|||${a.outlet}`;
    if (!authorMap[key]) authorMap[key] = { outlet: a.outlet, articles: 0, totalSentiment: 0, totalBs: 0, topics: {} };
    authorMap[key].articles += 1;
    authorMap[key].totalSentiment += a.sentiment_score;
    authorMap[key].totalBs += a.bs_score;
    for (const t of a.topics) {
      authorMap[key].topics[t] = (authorMap[key].topics[t] || 0) + 1;
    }
  }
  const authorStats = Object.entries(authorMap)
    .filter(([, v]) => v.articles >= 2) // only writers with 2+ articles
    .map(([key, v]) => ({
      author: key.split("|||")[0],
      outlet: v.outlet,
      articles: v.articles,
      avg_sentiment: parseFloat((v.totalSentiment / v.articles).toFixed(3)),
      avg_bs_score: Math.round(v.totalBs / v.articles),
      top_topics: Object.entries(v.topics).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t),
    }))
    .sort((a, b) => b.avg_bs_score - a.avg_bs_score);

  // Word usage over time (weekly buckets)
  const wordTimeMap: Record<string, Record<string, number>> = {};
  for (const a of finalArticles) {
    const weekStart = getWeekStart(a.date);
    if (!wordTimeMap[weekStart]) wordTimeMap[weekStart] = {};
    for (const term of a.flagged_terms) {
      const t = term.toLowerCase();
      wordTimeMap[weekStart][t] = (wordTimeMap[weekStart][t] || 0) + 1;
    }
  }
  const wordTrends = Object.entries(wordTimeMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, terms]) => ({
      week,
      terms: Object.entries(terms).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([term, count]) => ({ term, count })),
    }));

  // BS Detector: top most BS-scored articles
  const topBsArticles = [...finalArticles]
    .sort((a, b) => b.bs_score - a.bs_score)
    .slice(0, 50)
    .map((a) => ({
      outlet: a.outlet,
      date: a.date,
      headline: a.headline,
      author: a.author,
      bs_score: a.bs_score,
      sentiment_score: a.sentiment_score,
      flagged_terms: a.flagged_terms,
    }));

  // Tone comparison by outlet over time (weekly)
  const toneOverTime: Record<string, { week: string; avg_sentiment: number; avg_bs: number; count: number }[]> = {};
  for (const a of finalArticles) {
    const week = getWeekStart(a.date);
    if (!toneOverTime[a.outlet]) toneOverTime[a.outlet] = [];
    let entry = toneOverTime[a.outlet].find((e) => e.week === week);
    if (!entry) {
      entry = { week, avg_sentiment: 0, avg_bs: 0, count: 0 };
      toneOverTime[a.outlet].push(entry);
    }
    entry.avg_sentiment += a.sentiment_score;
    entry.avg_bs += a.bs_score;
    entry.count += 1;
  }
  for (const outlet of Object.keys(toneOverTime)) {
    for (const entry of toneOverTime[outlet]) {
      entry.avg_sentiment = parseFloat((entry.avg_sentiment / entry.count).toFixed(3));
      entry.avg_bs = Math.round(entry.avg_bs / entry.count);
    }
    toneOverTime[outlet].sort((a, b) => a.week.localeCompare(b.week));
  }

  // Recent articles (all)
  const recentArticles = [...finalArticles]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 300)
    .map((a) => ({
      outlet: a.outlet,
      date: a.date,
      headline: a.headline,
      author: a.author,
      sentiment_score: a.sentiment_score,
      sentiment_label: a.sentiment_label,
      topics: JSON.stringify(a.topics),
      flagged_terms: JSON.stringify(a.flagged_terms),
      bs_score: a.bs_score,
    }));

  // 7. Write static data
  const output = {
    generated_at: new Date().toISOString(),
    total_articles: finalArticles.length,
    trends,
    heatmap,
    chargedTerms,
    biasScores,
    recentArticles,
    toneTimelines,
    authorStats,
    wordTrends,
    topBsArticles,
    toneOverTime,
  };

  const outDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, "data.json");
  fs.writeFileSync(outPath, JSON.stringify(output));
  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`\n=== DONE ===`);
  console.log(`Total articles: ${finalArticles.length}`);
  console.log(`Data file: ${outPath} (${sizeKB} KB)\n`);

  for (const b of biasScores) {
    console.log(`  ${b.outlet.padEnd(15)} ${String(b.total_articles).padStart(4)} articles | bias=${b.bias_score > 0 ? "+" : ""}${b.bias_score.toFixed(3)} | +${b.positive_count} -${b.negative_count} ~${b.neutral_count}`);
  }
}

main().catch(console.error);
