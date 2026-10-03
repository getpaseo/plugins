// Generates dist/: index.json for the list pages and plugins/<id>.json for the detail pages.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { type PublishedIndex, resolvePlugin, summarize } from "./lib/listing.ts";
import { createNpmClient } from "./lib/npm.ts";
import { readRecords } from "./lib/record.ts";

const DIST = join(process.cwd(), "dist");
const categories = readCategories();
const records = readRecords(categorySlugs(categories));
const client = createNpmClient();

rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, "plugins"), { recursive: true });

// A few plugins at a time keeps the npm downloads API from rate-limiting the build.
const CONCURRENCY = 3;
const details = await mapLimit(records, CONCURRENCY, (record) => resolvePlugin(client, record));
for (const detail of details) {
  writeFileSync(join(DIST, "plugins", `${detail.id}.json`), `${JSON.stringify(detail, null, 2)}\n`);
}
const index: PublishedIndex = {
  generatedAt: new Date().toISOString(),
  categories,
  plugins: details.map(summarize).sort((a, b) => a.id.localeCompare(b.id)),
};
writeFileSync(join(DIST, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
writeFileSync(join(DIST, ".nojekyll"), "");
console.log(`dist/index.json: ${index.plugins.length} plugin(s)`);

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
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
