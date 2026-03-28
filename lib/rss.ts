import { XMLParser } from "fast-xml-parser";

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

export interface FeedConfig {
  outlet: string;
  url: string;
}

export const FEEDS: FeedConfig[] = [
  {
    outlet: "NYT",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
  },
  {
    outlet: "WSJ",
    url: "https://feeds.content.dowjones.io/public/rss/RSSMarketsMain",
  },
  {
    outlet: "Wired",
    url: "https://www.wired.com/feed/rss",
  },
  {
    outlet: "The Atlantic",
    url: "https://www.theatlantic.com/feed/all/",
  },
  {
    outlet: "TechCrunch",
    url: "https://techcrunch.com/feed/",
  },
  {
    outlet: "The Guardian",
    url: "https://www.theguardian.com/technology/rss",
  },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

export async function fetchFeed(feed: FeedConfig): Promise<RSSItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "MediaBiasMonitor/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error(`Feed ${feed.outlet} returned ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const parsed = parser.parse(xml);

    const channel = parsed?.rss?.channel || parsed?.feed;
    if (!channel) return [];

    // Handle both RSS 2.0 and Atom formats
    const items = channel.item || channel.entry || [];
    const list = Array.isArray(items) ? items : [items];

    return list.slice(0, 25).map((item: any) => ({
      title: stripHtml(typeof item.title === "object" ? item.title["#text"] || "" : item.title || ""),
      description: stripHtml(
        item.description ||
        item.summary ||
        item["media:description"] ||
        item.content?.["#text"] ||
        ""
      ),
      link: typeof item.link === "object" ? item.link["@_href"] || "" : item.link || "",
      pubDate: item.pubDate || item.published || item.updated || new Date().toISOString(),
    }));
  } catch (err) {
    console.error(`Error fetching ${feed.outlet}:`, err);
    return [];
  }
}

export async function fetchAllFeeds(): Promise<
  { outlet: string; items: RSSItem[] }[]
> {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => ({
      outlet: feed.outlet,
      items: await fetchFeed(feed),
    }))
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<{ outlet: string; items: RSSItem[] }>).value);
}
