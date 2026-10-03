// Checks every record offline, and with --online checks pinned versions against npm.
//   node scripts/validate.ts [--online] [--changed]   (--changed limits online checks to records changed vs origin/main)
import { basename } from "node:path";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { createNpmClient, resolveVersion } from "./lib/npm.ts";
import { readRecords } from "./lib/record.ts";
import { git } from "./lib/shell.ts";

const online = process.argv.includes("--online");
const changedOnly = process.argv.includes("--changed");

const known = categorySlugs(readCategories());
const records = readRecords(known);
console.log(`${records.length} record(s) are well-formed`);
if (!online) process.exit(0);

let selected = records;
if (changedOnly) {
  const changed = new Set(
    git(["diff", "--name-only", "origin/main...HEAD", "--", "plugins/"])
      .split("\n")
      .filter(Boolean)
      .map((path) => basename(path, ".json")),
  );
  selected = records.filter((record) => changed.has(record.id));
}

const client = createNpmClient();
const problems: string[] = [];
for (const record of selected) {
  try {
    const packument = await client.packument(record.package);
    const doc = resolveVersion(packument, record.version);
    if (doc.dist.integrity !== record.integrity) problems.push(`${record.id}: integrity does not match npm for ${record.version}`);
    if ((await client.file(doc.name, doc.version, "paseo-plugin.json")) === null) {
      problems.push(`${record.id}: ${record.version} does not ship paseo-plugin.json`);
    }
    if (record.repository?.commit) {
      const provenance = await client.provenance(doc.name, doc.version);
      if (!provenance || provenance.commit !== record.repository.commit) {
        problems.push(`${record.id}: repository.commit is not backed by npm provenance`);
      }
    }
  } catch (error) {
    problems.push(`${record.id}: ${(error as Error).message}`);
  }
}
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`${selected.length} record(s) match npm`);
