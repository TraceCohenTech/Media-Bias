export interface GdeltToneData {
  date: string;
  tone: number;
  positiveScore: number;
  negativeScore: number;
  themes: string[];
}

const GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc";

export async function fetchGdeltTone(
  query: string,
  timespan: string = "90d"
): Promise<GdeltToneData[]> {
  try {
    const url = `${GDELT_BASE}?query=${encodeURIComponent(query)}&mode=tonechart&timespan=${timespan}&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const data = await res.json();

    if (!data?.tonechart) return [];
    return data.tonechart.map((entry: any) => ({
      date: entry.date || "",
      tone: parseFloat(entry.tone) || 0,
      positiveScore: parseFloat(entry.positive) || 0,
      negativeScore: parseFloat(entry.negative) || 0,
      themes: [],
    }));
  } catch (err) {
    console.error("GDELT fetch error:", err);
    return [];
  }
}

export async function fetchGdeltThemes(
  query: string,
  timespan: string = "90d"
): Promise<{ theme: string; count: number }[]> {
  try {
    const url = `${GDELT_BASE}?query=${encodeURIComponent(query)}&mode=themechart&timespan=${timespan}&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const data = await res.json();

    if (!data?.themechart) return [];
    return data.themechart.slice(0, 20).map((entry: any) => ({
      theme: entry.theme || "",
      count: parseInt(entry.count) || 0,
    }));
  } catch (err) {
    console.error("GDELT themes error:", err);
    return [];
  }
}
