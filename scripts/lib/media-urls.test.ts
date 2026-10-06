import assert from "node:assert/strict";
import { test } from "node:test";
import { checkMediaUrls, mediaKind, parseMedia } from "./media.ts";

test("media entries require HTTPS and a supported image or video path extension", () => {
  for (const extension of ["png", "JPG", "jpeg", "webp", "gif"])
    assert.equal(mediaKind(`https://example.test/file.${extension}?size=2#preview`), "image");
  for (const extension of ["mp4", "WEBM"])
    assert.equal(mediaKind(`https://example.test/file.${extension}`), "video");
  for (const value of ["https://example.test/file.svg", "https://example.test/.gitkeep", "https://example.test/file?name=a.png",
    "http://example.test/a.png", "a.png", "https://", 42]) {
    assert.equal(mediaKind(value), null);
    assert.throws(() => parseMedia([value]), (error: Error) => error.message.includes(JSON.stringify(value)));
  }
  const media = ["https://example.test/demo.mp4", "https://example.test/image.png"];
  assert.deepEqual(parseMedia(media), media);
  assert.throws(() => parseMedia("https://example.test/a.png"), /array/);
});

test("HEAD checks are concurrent, bounded, deduplicated, and require 200 with a media content type", async () => {
  let active = 0;
  let peak = 0;
  let calls = 0;
  const request: typeof fetch = async (input, options) => {
    calls += 1;
    assert.equal(options?.method, "HEAD");
    assert.ok(options?.signal);
    peak = Math.max(peak, ++active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
    const path = new URL(String(input)).pathname;
    if (path === "/error.png") throw new Error("network unavailable");
    return new Response(null, { status: path === "/missing.png" ? 404 : path === "/partial.png" ? 206 : 200,
      headers: path === "/untyped.png" ? {} : { "content-type": path === "/html.png" ? "text/html" : path.endsWith(".mp4") ? "video/mp4" : "image/png" } });
  };
  const urls = Array.from({ length: 30 }, (_, i) => `https://example.test/${i}.png`);
  const bad = ["missing.png", "partial.png", "html.png", "untyped.png", "error.png"].map((path) => `https://example.test/${path}`);
  const problems = await checkMediaUrls([...urls, ...urls, "https://example.test/demo.mp4", ...bad], request);
  assert.equal(calls, 36);
  assert.ok(peak > 1 && peak <= 16, `peak concurrency: ${peak}`);
  assert.deepEqual([...problems.keys()].sort(), bad.sort());
  assert.equal(problems.get("https://example.test/missing.png"), "HTTP 404");
});

test("HEAD requests time out and report the affected URL", async () => {
  const request: typeof fetch = (_input, options) => new Promise((_resolve, reject) => {
    const keepAlive = setTimeout(() => reject(new Error("timeout signal was not used")), 1000);
    options!.signal!.addEventListener("abort", () => {
      clearTimeout(keepAlive);
      reject(options!.signal!.reason);
    }, { once: true });
  });
  const url = "https://example.test/slow.png";
  const problems = await checkMediaUrls([url], request, 10);
  assert.match(problems.get(url)!, /timeout/i);
});
