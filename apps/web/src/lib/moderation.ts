type ModerationInput =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface ModerationResult {
  flagged: boolean;
  /** Raw per-input results from the API, stored on the review for audit. */
  results: unknown;
}

/**
 * Runs text + images through OpenAI's omni-moderation-latest in one call.
 * Image URLs must be publicly fetchable (they are — the R2 bucket is public).
 * Throws on API failure/timeout; the caller fails closed (PENDING review).
 */
export async function moderateReview(
  text: string,
  imageUrls: string[],
): Promise<ModerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[moderation] OPENAI_API_KEY unset — skipping moderation (dev only)");
      return { flagged: false, results: null };
    }
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const input: ModerationInput[] = [
    { type: "text", text },
    ...imageUrls.map((url) => ({ type: "image_url" as const, image_url: { url } })),
  ];

  const res = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: "omni-moderation-latest", input }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Moderation API error: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { results: Array<{ flagged: boolean }> };
  return {
    flagged: data.results.some((r) => r.flagged),
    results: data.results,
  };
}
