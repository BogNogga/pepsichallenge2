/**
 * Scrapes product page URLs for og:image / twitter:image meta tags
 * to populate real product images.
 */

const FETCH_TIMEOUT_MS = 4000;
const MAX_HTML_BYTES = 200_000; // Read first ~200KB to catch meta tags in bloated pages

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function extractImageUrl(html: string): string | null {
  // 1. og:image (both attribute orderings)
  const ogMatch =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogMatch?.[1]) return ogMatch[1];

  // 2. twitter:image
  const twMatch =
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
  if (twMatch?.[1]) return twMatch[1];

  // 3. First plausible <img> src (skip non-product images)
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const src = imgMatch[1];
    if (src.startsWith("data:")) continue;
    if (src.endsWith(".svg")) continue;
    if (/pixel|tracking|1x1|spacer|blank|logo|icon|badge|avatar|scorecard/i.test(src)) continue;
    // Must look like a real image URL
    if (!/\.(jpe?g|png|webp)/i.test(src) && !/format=(auto|jpe?g|png|webp)/i.test(src)) continue;
    return src;
  }

  return null;
}

async function fetchImageUrl(sourceUrl: string): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      redirect: "follow",
    });

    if (!res.ok || !res.body) return null;

    // Read only the first chunk of HTML (meta tags are in <head>)
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (totalBytes < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      totalBytes += value.length;
    }

    reader.cancel().catch(() => {});

    const decoder = new TextDecoder("utf-8", { fatal: false });
    const html = chunks.map((c) => decoder.decode(c, { stream: true })).join("") + decoder.decode();

    return extractImageUrl(html);
  } catch {
    return null;
  }
}

export async function scrapeProductImages<
  T extends { sourceUrl: string; imageUrl: string | null },
>(products: T[]): Promise<T[]> {
  const results = await Promise.allSettled(
    products.map((p) => fetchImageUrl(p.sourceUrl))
  );

  return products.map((product, i) => {
    const result = results[i];
    const scraped = result.status === "fulfilled" ? result.value : null;
    return {
      ...product,
      imageUrl: scraped ?? product.imageUrl,
    };
  });
}
