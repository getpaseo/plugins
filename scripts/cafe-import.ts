// One-off catalog import; rerun with node scripts/cafe-import.ts.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { checkMediaUrls, mediaKind } from "./lib/media.ts";
import { RECORDS_DIR } from "./lib/record.ts";

export function cafeSlug(overview: string): string | null {
  const lastLine = overview.trimEnd().split(/\r?\n/).at(-1)!;
  return /^\*This plugin entry was imported from \[paseo\.cafe\]\(https:\/\/paseo\.cafe\/plugins\/([a-z0-9]+(?:-[a-z0-9]+)*)\)\.\*$/.exec(lastLine)?.[1] ?? null;
}

export function utcDate(addedAt: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(addedAt))
    throw new Error(`Invalid addedAt timestamp: ${addedAt}`);
  const date = new Date(addedAt);
  if (!Number.isFinite(date.getTime())) throw new Error(`Invalid addedAt timestamp: ${addedAt}`);
  return date.toISOString().slice(0, 10);
}

export async function importCafe(catalog: unknown, directory = RECORDS_DIR, request: typeof fetch = fetch) {
  if (!catalog || typeof catalog !== "object" || !("plugins" in catalog) || !Array.isArray(catalog.plugins))
    throw new Error("Catalog must contain a plugins array");
  const entries = new Map<string, { addedAt: string | null; images: string[] }>();
  for (const entry of catalog.plugins) {
    if (!entry || typeof entry.id !== "string" ||
        (entry.addedAt != null && typeof entry.addedAt !== "string") ||
        (entry.images != null && (!Array.isArray(entry.images) || entry.images.some((image: unknown) => typeof image !== "string"))))
      throw new Error("Catalog entries must have an id, optional addedAt string, and optional images array of strings");
    if (entries.has(entry.id)) throw new Error(`Duplicate catalog id: ${entry.id}`);
    entries.set(entry.id, { addedAt: entry.addedAt || null, images: entry.images ?? [] });
  }
  const candidates: { id: string; path: string; original: string; text: string; listing?: Record<string, unknown>; media?: string[] }[] = [];
  let extensionSkipped = 0;
  const datesUpdated: string[] = [];
  const mediaUpdated: string[] = [];
  const skipped: { id: string; reason: string }[] = [];
  for (const file of readdirSync(directory, { recursive: true }).map(String).sort()) {
    if (!/^[^/]+\/[^/]+\.json$/.test(file)) continue;
    const id = file.slice(0, -5);
    const overviewPath = join(directory, `${id}.md`);
    const slug = existsSync(overviewPath) ? cafeSlug(readFileSync(overviewPath, "utf8")) : null;
    const entry = slug === null ? undefined : entries.get(slug);
    if (!entry) {
      skipped.push({ id, reason: slug === null ? "no import credit line" : `no catalog entry for ${slug}` });
      continue;
    }
    const path = join(directory, file);
    const original = readFileSync(path, "utf8");
    let text = original;
    if (entry.addedAt) {
      const date = utcDate(entry.addedAt);
      if (date < "2026-09-01" || new Date(entry.addedAt).getTime() > Date.now())
        throw new Error(`${id}: addedAt is outside 2026-09-01 through now`);
      let replaced = 0;
      text = text.replace(/^(  "(?:submittedAt|reviewedAt)"\s*:\s*)"[^"\r\n]*"/gm,
        (_match, prefix) => { replaced += 1; return `${prefix}"${date}"`; });
      if (replaced !== 2) throw new Error(`${id}: expected two record date fields`);
      if (text !== original) datesUpdated.push(id);
    } else skipped.push({ id, reason: `no addedAt for ${slug}` });

    const record = JSON.parse(text);
    let media: string[] | undefined;
    if (!record.listing?.media?.length) {
      media = entry.images.filter((url) => {
        if (mediaKind(url)) return true;
        extensionSkipped += 1;
        skipped.push({ id, reason: `unsupported media URL or extension: ${url}` });
        return false;
      });
      if (!entry.images.length) skipped.push({ id, reason: `no images for ${slug}` });
    }
    candidates.push({ id, path, original, text, listing: record.listing, media });
  }
  const failures = await checkMediaUrls(candidates.flatMap((candidate) => candidate.media ?? []), request);
  let onlineDropped = 0;
  let mediaCarried = 0;
  const noMedia: string[] = [];
  const changes: { path: string; text: string }[] = [];
  for (const candidate of candidates) {
    let { text } = candidate;
    if (candidate.media !== undefined) {
      const accepted = candidate.media.filter((url) => {
        if (!failures.has(url)) return true;
        onlineDropped += 1;
        skipped.push({ id: candidate.id, reason: `media ${url}: ${failures.get(url)}` });
        return false;
      });
      mediaCarried += accepted.length;
      if (accepted.length) mediaUpdated.push(candidate.id);
      else noMedia.push(candidate.id);
      // An unsuccessful carry-over is explicitly empty, rather than an artifact fallback.
      text = withMedia(text, candidate.listing, accepted);
    }
    if (text !== candidate.original) changes.push({ path: candidate.path, text });
  }
  // Validate every candidate before writing any records. Preserve unrelated bytes.
  for (const change of changes) writeFileSync(change.path, change.text);
  return { datesUpdated, mediaUpdated, mediaCarried, extensionSkipped, onlineDropped, noMedia, skipped };
}

function withMedia(text: string, listing: Record<string, unknown> | undefined, images: string[]): string {
  const format = (value: unknown) => JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");
  const replacement = `  "listing": ${format({ ...listing, media: images })}`;
  if (listing === undefined) return text.replace(/\n}\s*$/, (ending) => `,\n${replacement}${ending}`);
  const previous = `  "listing": ${format(listing)}`;
  if (!text.includes(previous)) throw new Error("Unexpected listing formatting; refusing to rewrite unrelated fields");
  return text.replace(previous, () => replacement);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const response = await fetch("https://paseo.cafe/api/plugins", { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Catalog fetch failed: HTTP ${response.status}`);
  const result = await importCafe(await response.json());
  console.log(`Updated dates in ${result.datesUpdated.length} record(s)`);
  console.log(`Added media to ${result.mediaUpdated.length} record(s)`);
  console.log(`Carried ${result.mediaCarried} media entries; skipped ${result.extensionSkipped} by extension; dropped ${result.onlineDropped} online`);
  for (const id of result.noMedia) console.log(`No media: ${id}`);
  for (const entry of result.skipped) console.log(`Skipped ${entry.id}: ${entry.reason}`);
}
