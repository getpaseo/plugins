// Checks every record offline, and with --online checks pinned versions against their artifacts.
//   node scripts/validate.ts [--online] [--changed] [--base <ref>] [--allow-imports]
// --allow-imports permits approved new imports with registry stopgaps, never changed pins.
import { validateArtifact } from "./lib/validate-artifact.ts";
import { flagString, parseArgs } from "./lib/args.ts";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { createNpmClient } from "./lib/npm.ts";
import { readOverview } from "./lib/overview.ts";
import { parseRecord, readRecords } from "./lib/record.ts";
import { git } from "./lib/shell.ts";

const { flags } = parseArgs(process.argv.slice(2));
const online = flags.has("online");
const changedOnly = flags.has("changed");
const allowNewImport = flags.has("allow-imports");
const base = flagString(flags, "base") ?? "origin/main";

const known = categorySlugs(readCategories());
const records = readRecords(known);
for (const record of records) readOverview(record.id);
console.log(`${records.length} record(s) are well-formed`);
if (!online) process.exit(0);

// Compare pins to the branch base, rather than treating any edited record as a bump.
const baseCommit = git(["merge-base", base, "HEAD"]);
const baseFiles = new Set(git(["ls-tree", "-r", "--name-only", baseCommit, "--", "plugins/"]).split("\n"));
let selected = records;
if (changedOnly) {
  const changed = new Set(
    git(["diff", "--name-only", `${baseCommit}...HEAD`, "--", "plugins/"])
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
    const path = `plugins/${record.id}.json`;
    const previous = baseFiles.has(path)
      ? parseRecord(JSON.parse(git(["show", `${baseCommit}:${path}`])), known)
      : null;
    problems.push(...(await validateArtifact(client, record, {
      previous,
      registryOverview: readOverview(record.id),
      allowNewImport,
    })));
  } catch (error) {
    problems.push(`${record.id}: ${(error as Error).message}`);
  }
}
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`${selected.length} record(s) match their pinned artifacts`);
