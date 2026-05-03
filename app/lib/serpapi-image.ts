/**
 * Resolves product images via SerpAPI's Google Shopping engine.
 * For each product, queries Google Shopping with a normalized
 * "<brand> <name>" and takes the thumbnail from the first result.
 */

import { log } from "./logger";

const FETCH_TIMEOUT_MS = 15000;
const SERPAPI_URL = "https://serpapi.com/search.json";

let warnedMissingKey = false;

type SerpapiShoppingResult = {
  thumbnail?: string;
  image?: string;
};

type SerpapiResponse = {
  shopping_results?: SerpapiShoppingResult[];
  inline_shopping_results?: SerpapiShoppingResult[];
  immersive_products?: SerpapiShoppingResult[];
  product_results?: SerpapiShoppingResult[];
  error?: string;
};

/**
 * Build a clean Google Shopping query from brand + name.
 * - Avoids brand duplication ("Sony Sony WF-1000XM5")
 * - Strips descriptive tails and punctuation that hurt match quality
 * - Caps length to the first ~6 tokens
 */
export function buildQuery(brand: string | undefined, name: string): string {
  let q = name.trim();
  const b = (brand ?? "").trim();

  // Only prepend brand if name doesn't already contain it (case-insensitive).
  if (b && !q.toLowerCase().includes(b.toLowerCase())) {
    q = `${b} ${q}`;
  }

  // Strip punctuation that confuses Google Shopping (parens, slashes, plus, commas).
  q = q.replace(/[()\[\]/\\+,|]/g, " ");

  // Remove common descriptive tail words that make queries too specific.
  q = q.replace(
    /\b(true\s+wireless|wireless|noise[-\s]?cancell?ing|anc|earbuds?|headphones?|in[-\s]?ears?|with\s+.*)\b/gi,
    " "
  );

  // Collapse whitespace, cap to first 6 tokens.
  q = q.replace(/\s+/g, " ").trim();
  const tokens = q.split(" ").slice(0, 6);
  return tokens.join(" ");
}

function pickThumbnail(json: SerpapiResponse): string | null {
  const buckets = [
    json.shopping_results,
    json.inline_shopping_results,
    json.immersive_products,
    json.product_results,
  ];
  for (const bucket of buckets) {
    const first = bucket?.[0];
    if (first?.thumbnail) return first.thumbnail;
    if (first?.image) return first.image;
  }
  return null;
}

type FetchOnceResult =
  | { ok: true; thumb: string | null; resultKeys: string[]; apiError?: string }
  | { ok: false; error: string; status?: number };

async function fetchThumbnailOnce(
  query: string,
  apiKey: string
): Promise<FetchOnceResult> {
  try {
    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query,
      api_key: apiKey,
      num: "1",
      hl: "en",
      gl: "us",
    });

    const res = await fetch(`${SERPAPI_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}`, status: res.status };
    }

    const json = (await res.json()) as SerpapiResponse;
    const thumb = pickThumbnail(json);
    const resultKeys = Object.keys(json).filter((k) =>
      [
        "shopping_results",
        "inline_shopping_results",
        "immersive_products",
        "product_results",
      ].includes(k)
    );
    return { ok: true, thumb, resultKeys, apiError: json.error };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function fetchThumbnail(
  query: string,
  apiKey: string,
  sessionId: string,
  productName: string
): Promise<string | null> {
  // SerpAPI has cold-cache tail latency — a query that times out on the first
  // hit often resolves in <1s on retry. One retry catches that case cheaply.
  let result = await fetchThumbnailOnce(query, apiKey);
  let attempts = 1;
  if (!result.ok || (result.ok && !result.thumb)) {
    const retry = await fetchThumbnailOnce(query, apiKey);
    attempts = 2;
    // Prefer retry if it gave us something better than the first try.
    if (retry.ok && retry.thumb) result = retry;
    else if (!result.ok && retry.ok) result = retry;
  }

  if (result.ok) {
    log({
      type: "ai_output",
      sessionId,
      route: "serpapi",
      data: {
        product: productName,
        query,
        attempts,
        resolved: Boolean(result.thumb),
        resultKeys: result.resultKeys,
        apiError: result.apiError,
      },
    });
    return result.thumb;
  }

  log({
    type: "ai_output",
    sessionId,
    route: "serpapi",
    data: { product: productName, query, attempts, resolved: false, status: result.status },
    error: result.error,
  });
  return null;
}

export async function fetchSerpapiImages<
  T extends { name: string; brand?: string; imageUrl: string | null },
>(products: T[], sessionId = "unknown"): Promise<T[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    if (!warnedMissingKey) {
      console.warn("SERPAPI_API_KEY is not set — skipping image lookup.");
      warnedMissingKey = true;
    }
    // No key → no image resolution; null everything so placeholders render.
    return products.map((p) => ({ ...p, imageUrl: null }));
  }

  const results = await Promise.allSettled(
    products.map((p) =>
      fetchThumbnail(buildQuery(p.brand, p.name), apiKey, sessionId, p.name)
    )
  );

  return products.map((product, i) => {
    const result = results[i];
    const thumbnail = result.status === "fulfilled" ? result.value : null;
    // Always overwrite imageUrl with the SerpAPI result. If SerpAPI returned
    // nothing, force null so the placeholder renders — this prevents any
    // hallucinated URL from Claude leaking through as a broken image.
    return {
      ...product,
      imageUrl: thumbnail,
    };
  });
}
