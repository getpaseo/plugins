/** Classify the URL path, ignoring query strings and fragments. */
export function mediaKind(value: unknown): "image" | "video" | null {
  if (typeof value !== "string" || !/^https:\/\/\S+$/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (/\.(png|jpe?g|webp|gif)$/i.test(url.pathname)) return "image";
    if (/\.(mp4|webm)$/i.test(url.pathname)) return "video";
  } catch { /* Invalid URLs are rejected below. */ }
  return null;
}

export function parseMedia(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error("media must be an array of HTTPS image or video URLs");
  for (const [index, entry] of value.entries()) {
    if (!mediaKind(entry)) throw new Error(`media[${index}] ${JSON.stringify(entry)} must be an HTTPS image (png, jpg, jpeg, webp, gif) or video (mp4, webm) URL`);
  }
  return value;
}

/** Check each distinct URL once, with at most 16 requests in flight and a 10s timeout. */
export async function checkMediaUrls(urls: string[], request: typeof fetch = fetch, timeoutMs = 10000): Promise<Map<string, string>> {
  const unique = [...new Set(urls)];
  const problems = new Map<string, string>();
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(16, unique.length) }, async () => {
    while (next < unique.length) {
      const url = unique[next++];
      try {
        const response = await request(url, { method: "HEAD", signal: AbortSignal.timeout(timeoutMs) });
        const contentType = response.headers.get("content-type") ?? "";
        if (response.status !== 200) problems.set(url, `HTTP ${response.status}`);
        else if (!/^(image|video)\//i.test(contentType)) problems.set(url, `content-type ${contentType || "missing"}`);
      } catch (error) {
        problems.set(url, error instanceof Error ? error.message : String(error));
      }
    }
  }));
  return problems;
}
