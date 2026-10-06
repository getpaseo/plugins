// Checks every record offline, and with --online checks pinned versions against their artifacts.
//   node scripts/validate.ts [--online] [--changed]   (--changed limits online checks to records changed vs origin/main)
import { validateArtifact } from "./lib/validate-artifact.ts";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { createNpmClient } from "./lib/npm.ts";
import { readOverview } from "./lib/overview.ts";
import { readRecords } from "./lib/record.ts";
import { git } from "./lib/shell.ts";

const online = process.argv.includes("--online");
const changedOnly = process.argv.includes("--changed");

const known = categorySlugs(readCategories());
const records = readRecords(known);
for (const record of records) readOverview(record.id);
console.log(`${records.length} record(s) are well-formed`);
if (!online) process.exit(0);

let selected = records;
if (changedOnly) {
  const changed = new Set(
    git(["diff", "--name-only", "origin/main...HEAD", "--", "plugins/"])
      .split("\n")
      .filter(Boolean)
      .map((path) => path.replace(/^plugins\//, "").replace(/\.(?:json|md)$/, "")),
  );
  selected = records.filter((record) => changed.has(record.id));
}

const client = createNpmClient();
const problems: string[] = [];
for (const record of selected) {
  try {
    problems.push(...(await validateArtifact(client, record)));
  } catch (error) {
    problems.push(`${record.id}: ${(error as Error).message}`);
  }
}
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`${selected.length} record(s) match their pinned artifacts`);
