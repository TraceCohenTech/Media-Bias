import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();

    // Sentiment trends by outlet over time
    const trends = db
      .prepare(
        `SELECT outlet, date,
         AVG(sentiment_score) as avg_score,
         COUNT(*) as article_count
         FROM articles
         WHERE date >= date('now', '-90 days')
         GROUP BY outlet, date
         ORDER BY date ASC`
      )
      .all();

    // Bias heatmap: avg sentiment per outlet per topic
    const heatmapRaw = db
      .prepare(
        `SELECT outlet, topics, AVG(sentiment_score) as avg_score, COUNT(*) as count
         FROM articles
         WHERE date >= date('now', '-90 days')
         GROUP BY outlet`
      )
      .all() as any[];

    // Build heatmap by parsing topics JSON
    const heatmap: Record<string, Record<string, { score: number; count: number }>> = {};
    for (const row of heatmapRaw) {
      try {
        const topics = JSON.parse(row.topics || "[]");
        for (const topic of topics) {
          if (!heatmap[row.outlet]) heatmap[row.outlet] = {};
          if (!heatmap[row.outlet][topic]) {
            heatmap[row.outlet][topic] = { score: 0, count: 0 };
          }
          heatmap[row.outlet][topic].score += row.avg_score;
          heatmap[row.outlet][topic].count += 1;
        }
      } catch {}
    }

    // Normalize heatmap scores
    for (const outlet of Object.keys(heatmap)) {
      for (const topic of Object.keys(heatmap[outlet])) {
        const entry = heatmap[outlet][topic];
        entry.score = entry.score / entry.count;
      }
    }

    // Top charged terms per outlet
    const termsRaw = db
      .prepare(
        `SELECT outlet, flagged_terms
         FROM articles
         WHERE date >= date('now', '-90 days') AND flagged_terms IS NOT NULL`
      )
      .all() as any[];

    const termCounts: Record<string, Record<string, number>> = {};
    for (const row of termsRaw) {
      try {
        const terms = JSON.parse(row.flagged_terms || "[]");
        if (!termCounts[row.outlet]) termCounts[row.outlet] = {};
        for (const term of terms) {
          const t = term.toLowerCase();
          termCounts[row.outlet][t] = (termCounts[row.outlet][t] || 0) + 1;
        }
      } catch {}
    }

    const chargedTerms: Record<string, { term: string; count: number }[]> = {};
    for (const [outlet, terms] of Object.entries(termCounts)) {
      chargedTerms[outlet] = Object.entries(terms)
        .map(([term, count]) => ({ term, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);
    }

    // Rolling 90-day bias score per outlet
    const biasScores = db
      .prepare(
        `SELECT outlet,
         AVG(sentiment_score) as bias_score,
         COUNT(*) as total_articles,
         SUM(CASE WHEN sentiment_label = 'positive' THEN 1 ELSE 0 END) as positive_count,
         SUM(CASE WHEN sentiment_label = 'negative' THEN 1 ELSE 0 END) as negative_count,
         SUM(CASE WHEN sentiment_label = 'neutral' THEN 1 ELSE 0 END) as neutral_count
         FROM articles
         WHERE date >= date('now', '-90 days')
         GROUP BY outlet
         ORDER BY bias_score DESC`
      )
      .all();

    // Recent articles
    const recentArticles = db
      .prepare(
        `SELECT outlet, date, headline, sentiment_score, sentiment_label, topics, flagged_terms
         FROM articles
         ORDER BY created_at DESC
         LIMIT 50`
      )
      .all();

    return NextResponse.json({
      trends,
      heatmap,
      chargedTerms,
      biasScores,
      recentArticles,
    });
  } catch (err: any) {
    console.error("Data fetch error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
