// Generates dist/: index.json for the list pages and plugins/<id>.json for the detail pages.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { type PublishedIndex, resolvePlugin, summarize } from "./lib/listing.ts";
import { createNpmClient } from "./lib/npm.ts";
import { readOverview } from "./lib/overview.ts";
import { readRecords } from "./lib/record.ts";

const DIST = join(process.cwd(), "dist");
const categories = readCategories();
const records = readRecords(categorySlugs(categories));
const client = createNpmClient();

rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, "plugins"), { recursive: true });

// Bound concurrent requests to package hosts.
const CONCURRENCY = 3;
const details = await mapLimit(records, CONCURRENCY, (record) =>
  // Registry content is the stopgap after explicit and author-owned artifact content.
  resolvePlugin(client, record, readOverview(record.id)),
);
let installs: Record<string, number> = {};
try {
  const response = await fetch(
    process.env.INSTALLS_URL ?? "https://paseo.sh/api/plugins/installs",
    { signal: AbortSignal.timeout(10000) },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const raw = await response.json();
  if (raw && typeof raw === "object")
    installs = Object.fromEntries(
      Object.entries(raw).filter(([, count]) => Number.isSafeInteger(count) && Number(count) >= 0),
    ) as Record<string, number>;
} catch (error) {
  console.warn(`Installs unavailable: ${String(error)}`);
}
for (const detail of details) {
  if (installs[detail.id] !== undefined) detail.installs = installs[detail.id];
  mkdirSync(dirname(join(DIST, "plugins", `${detail.id}.json`)), { recursive: true });
  writeFileSync(join(DIST, "plugins", `${detail.id}.json`), `${JSON.stringify(detail, null, 2)}\n`);
}
const index: PublishedIndex = {
  schemaVersion: 1,
  registry: { name: "Paseo plugins", url: process.env.REGISTRY_URL ?? "https://plugins.paseo.sh" },
  generatedAt: new Date().toISOString(),
  categories,
  plugins: details.map(summarize).sort((a, b) => a.id.localeCompare(b.id)),
};
writeFileSync(join(DIST, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
writeFileSync(join(DIST, ".nojekyll"), "");
console.log(`dist/index.json: ${index.plugins.length} plugin(s)`);

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        results[index] = await fn(items[index]);
      }
    }),
  );
  return results;
}
