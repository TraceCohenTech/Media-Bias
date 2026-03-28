import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fetchAllFeeds } from "@/lib/rss";
import { analyzeBatch } from "@/lib/sentiment";
import { fetchGdeltTone } from "@/lib/gdelt";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    const db = getDb();
    const allFeeds = await fetchAllFeeds();

    let totalInserted = 0;
    let totalScored = 0;

    for (const feed of allFeeds) {
      const newItems: { headline: string; summary: string; item: any }[] = [];

      for (const item of feed.items) {
        if (!item.title || !item.link) continue;

        const existing = db
          .prepare("SELECT id FROM articles WHERE url = ?")
          .get(item.link);
        if (existing) continue;

        newItems.push({ headline: item.title, summary: item.description, item });
      }

      if (newItems.length === 0) continue;

      // Score with Claude
      const sentiments = await analyzeBatch(
        newItems.map((n) => ({ headline: n.headline, summary: n.summary }))
      );

      const insert = db.prepare(`
        INSERT OR IGNORE INTO articles (outlet, date, headline, summary, url, sentiment_score, sentiment_label, topics, flagged_terms)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction(
        (
          items: { headline: string; summary: string; item: any }[],
          scores: typeof sentiments
        ) => {
          for (let i = 0; i < items.length; i++) {
            const { item } = items[i];
            const s = scores[i];
            const pubDate = new Date(item.pubDate).toISOString().split("T")[0];

            insert.run(
              feed.outlet,
              pubDate,
              item.title,
              item.description?.slice(0, 1000) || "",
              item.link,
              s.score,
              s.label,
              JSON.stringify(s.topics),
              JSON.stringify(s.flaggedTerms)
            );
          }
        }
      );

      insertMany(newItems, sentiments);
      totalInserted += newItems.length;
      totalScored += sentiments.length;
    }

    // Fetch GDELT tone data for context
    const gdeltTone = await fetchGdeltTone("technology");

    return NextResponse.json({
      success: true,
      inserted: totalInserted,
      scored: totalScored,
      gdeltEntries: gdeltTone.length,
      feeds: allFeeds.map((f) => ({
        outlet: f.outlet,
        items: f.items.length,
      })),
    });
  } catch (err: any) {
    console.error("Refresh error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
