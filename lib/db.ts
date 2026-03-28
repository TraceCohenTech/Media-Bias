import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "media-bias.db")
  : path.join(process.cwd(), "media-bias.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        outlet TEXT NOT NULL,
        date TEXT NOT NULL,
        headline TEXT NOT NULL,
        summary TEXT,
        url TEXT UNIQUE,
        sentiment_score REAL,
        sentiment_label TEXT,
        topics TEXT,
        flagged_terms TEXT,
        gdelt_tone REAL,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_outlet_date ON articles(outlet, date);
      CREATE INDEX IF NOT EXISTS idx_sentiment ON articles(sentiment_score);
    `);
  }
  return db;
}
