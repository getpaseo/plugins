import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FEATURED_PATH = fileURLToPath(new URL("../../featured.json", import.meta.url));

/** Read maintainer-selected IDs in display order, validating them against the registry. */
export function readFeatured(records: { id: string }[], path = FEATURED_PATH): string[] {
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(value) || value.some((id) => typeof id !== "string"))
    throw new Error("featured.json must be an array of record IDs");
  const known = new Set(records.map((record) => record.id));
  const seen = new Set<string>();
  for (const id of value) {
    if (!known.has(id)) throw new Error(`featured.json: unknown record "${id}"`);
    if (seen.has(id)) throw new Error(`featured.json: duplicate record "${id}"`);
    seen.add(id);
  }
  return value;
}
