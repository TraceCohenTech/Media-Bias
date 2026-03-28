import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface SentimentResult {
  score: number;
  label: "positive" | "negative" | "neutral";
  topics: string[];
  flaggedTerms: string[];
}

export async function analyzeSentiment(
  headline: string,
  summary: string
): Promise<SentimentResult> {
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Analyze this news headline and summary for media bias. Return ONLY valid JSON with no other text.

Headline: "${headline}"
Summary: "${summary.slice(0, 500)}"

Return JSON with:
- "score": number from -1.0 (very negative) to 1.0 (very positive), 0 = neutral
- "label": "positive", "negative", or "neutral"
- "topics": array of detected topics from ONLY these categories: ["tech", "AI", "regulation", "founder/CEO coverage", "politics", "economy", "security", "climate"]
- "flaggedTerms": array of charged/loaded language words found (e.g., "slammed", "destroyed", "revolutionary", "game-changing", "controversial")`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleaned);

    return {
      score: Math.max(-1, Math.min(1, parseFloat(result.score) || 0)),
      label: result.label || "neutral",
      topics: Array.isArray(result.topics) ? result.topics : [],
      flaggedTerms: Array.isArray(result.flaggedTerms)
        ? result.flaggedTerms
        : [],
    };
  } catch (err) {
    console.error("Sentiment analysis error:", err);
    return { score: 0, label: "neutral", topics: [], flaggedTerms: [] };
  }
}

export async function analyzeBatch(
  items: { headline: string; summary: string }[]
): Promise<SentimentResult[]> {
  // Process in batches of 5 to avoid rate limits
  const results: SentimentResult[] = [];
  const batchSize = 5;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => analyzeSentiment(item.headline, item.summary))
    );
    results.push(...batchResults);

    if (i + batchSize < items.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return results;
}
