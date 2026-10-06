import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { cafeSlug, importCafe, utcDate } from "./cafe-import.ts";

const acceptMedia: typeof fetch = async () => new Response(null, { headers: { "content-type": "image/png" } });

const credit = (slug: string) => `*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/${slug}).*`;

test("only the final import credit line identifies a catalog slug", () => {
  assert.equal(cafeSlug(`Overview.\n\n${credit("original-slug")}\n`), "original-slug");
  assert.equal(cafeSlug(`Overview.\r\n${credit("original-slug")}\r\n\r\n`), "original-slug");
  for (const overview of ["", "Overview.", `${credit("example")}\nMore text`,
    `Quoted ${credit("example")}`, credit("../example"), credit("example").replace("https:", "http:")])
    assert.equal(cafeSlug(overview), null);
});

test("catalog timestamps become UTC calendar dates across timezone boundaries", () => {
  assert.equal(utcDate("2026-09-12T18:01:41+03:00"), "2026-09-12");
  assert.equal(utcDate("2026-09-12T00:01:41+03:00"), "2026-09-11");
  assert.equal(utcDate("2026-09-12T23:01:41-03:00"), "2026-09-13");
  assert.equal(utcDate("2026-09-12T18:01:41.123Z"), "2026-09-12");
  for (const value of ["yesterday", "2026-09-12", "2026-09-12T18:01:41", "2026-13-12T18:01:41Z"])
    assert.throws(() => utcDate(value), /Invalid addedAt/);
});

test("import joins by credit slug, preserves other bytes, lists skips, and is rerunnable", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "cafe-dates-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(join(directory, "owner"));
  const original = '{\n  "submittedAt": "2026-10-06",\n  "reviewedAt": "2026-10-06",\n  "updatedAt": "2026-10-06",\n  "other": "keep \\u0061 and whitespace",\n  "listing": {\n    "media": []\n  }\n}\n';
  for (const slug of ["renamed", "no-credit", "missing", "undated"]) {
    writeFileSync(join(directory, `owner/${slug}.json`), original);
    if (slug !== "no-credit") writeFileSync(join(directory, `owner/${slug}.md`), credit(slug === "renamed" ? "cafe-name" : slug));
  }
  const catalog = { plugins: [{ id: "cafe-name", addedAt: "2026-09-12T00:01:41+03:00", images: [] }, { id: "undated" }] };
  const result = await importCafe(catalog, directory, acceptMedia);
  assert.deepEqual(result.datesUpdated, ["owner/renamed"]);
  assert.deepEqual(result.skipped, [
    { id: "owner/missing", reason: "no catalog entry for missing" },
    { id: "owner/no-credit", reason: "no import credit line" },
    { id: "owner/renamed", reason: "no images for cafe-name" },
    { id: "owner/undated", reason: "no addedAt for undated" },
    { id: "owner/undated", reason: "no images for undated" },
  ]);
  assert.equal(readFileSync(join(directory, "owner/renamed.json"), "utf8"),
    original.replace('"submittedAt": "2026-10-06"', '"submittedAt": "2026-09-11"')
      .replace('"reviewedAt": "2026-10-06"', '"reviewedAt": "2026-09-11"'));
  for (const { id } of result.skipped.filter((entry) => entry.id !== "owner/renamed")) assert.equal(readFileSync(join(directory, `${id}.json`), "utf8"), original);
  assert.deepEqual((await importCafe(catalog, directory, acceptMedia)).datesUpdated, []);
  for (const addedAt of ["2026-08-31T23:59:59Z", "2099-01-01T00:00:00Z"]) {
    await assert.rejects(importCafe({ plugins: [{ id: "cafe-name", addedAt }] }, directory, acceptMedia), /outside/);
  }
});

test("media fill absent or empty listings, preserve existing images, and reject non-HTTPS URLs", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "cafe-images-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(join(directory, "owner"));
  const images = ["https://raw.githubusercontent.com/owner/repo/abc/screen.png"];
  const originals = new Map<string, string>();
  for (const [id, listing] of Object.entries({ absent: undefined, empty: { name: "Keep name", media: [] },
    named: { name: "Keep name" }, existing: { media: ["https://example.test/existing.png"] } })) {
    const record = { id: `owner/${id}`, submittedAt: "2026-09-12", reviewedAt: "2026-09-12", listing };
    const text = `${JSON.stringify(record, null, 2)}\n`;
    originals.set(id, text);
    writeFileSync(join(directory, `owner/${id}.json`), text);
    writeFileSync(join(directory, `owner/${id}.md`), credit(id));
  }
  const catalog = { plugins: [...originals.keys()].map((id) => ({ id,
    // Missing dates must not prevent media import.
    images: [...images, "http://example.test/image.png", "file:///image.png", "https://", "image.png"],
  })) };
  const result = await importCafe(catalog, directory, acceptMedia);
  assert.deepEqual(result.mediaUpdated, ["owner/absent", "owner/empty", "owner/named"]);
  assert.equal(result.skipped.filter(({ reason }) => reason.startsWith("unsupported media URL or extension")).length, 12);
  for (const id of ["absent", "empty", "named"]) {
    const original = JSON.parse(originals.get(id)!);
    const actual = JSON.parse(readFileSync(join(directory, `owner/${id}.json`), "utf8"));
    assert.deepEqual(actual, { ...original, listing: { ...original.listing, media: images } });
  }
  assert.equal(readFileSync(join(directory, "owner/existing.json"), "utf8"), originals.get("existing"));
  assert.deepEqual((await importCafe(catalog, directory, acceptMedia)).mediaUpdated, []);
});

test("carry-over drops failed HEAD checks in order and reports records left without media", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "cafe-media-online-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(join(directory, "owner"));
  for (const id of ["mixed", "empty"]) {
    writeFileSync(join(directory, `owner/${id}.json`), '{\n  "submittedAt": "2026-09-12",\n  "reviewedAt": "2026-09-12"\n}\n');
    writeFileSync(join(directory, `owner/${id}.md`), credit(id));
  }
  const request: typeof fetch = async (input) => new Response(null, {
    status: String(input).includes("missing") ? 404 : 200,
    headers: { "content-type": "image/png" },
  });
  const result = await importCafe({ plugins: [
    { id: "mixed", images: ["https://example.test/demo.mp4", "https://example.test/missing.png", "https://example.test/card.png", "https://example.test/.gitkeep"] },
    { id: "empty", images: ["https://example.test/missing.png"] },
  ] }, directory, request);
  assert.equal(result.mediaCarried, 2);
  assert.equal(result.extensionSkipped, 1);
  assert.equal(result.onlineDropped, 2);
  assert.deepEqual(result.noMedia, ["owner/empty"]);
  assert.deepEqual(JSON.parse(readFileSync(join(directory, "owner/mixed.json"), "utf8")).listing.media,
    ["https://example.test/demo.mp4", "https://example.test/card.png"]);
  assert.deepEqual(JSON.parse(readFileSync(join(directory, "owner/empty.json"), "utf8")).listing.media, []);
});
