// Checks every record offline, and with --online checks pinned versions against their artifacts.
//   node scripts/validate.ts [--online] [--changed] [--base <ref>] [--allow-imports]
// --allow-imports permits approved new imports with registry stopgaps, never changed pins.
import { validateArtifact } from "./lib/validate-artifact.ts";
import { flagString, parseArgs } from "./lib/args.ts";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { createNpmClient } from "./lib/npm.ts";
import { readOverview } from "./lib/overview.ts";
import { readRecords } from "./lib/record.ts";
import { checkMediaUrls, mediaKind } from "./lib/media.ts";
import { git } from "./lib/shell.ts";

const { flags } = parseArgs(process.argv.slice(2));
const online = flags.has("online");
const changedOnly = flags.has("changed");
const allowNewImport = flags.has("allow-imports");
const base = flagString(flags, "base") ?? "origin/main";

const known = categorySlugs(readCategories());
const records = readRecords(known);
const themesWithoutImages = records.filter((record) =>
  record.categories.includes("themes") && !record.listing?.media?.some((url) => mediaKind(url) === "image"),
);
if (themesWithoutImages.length) {
  console.error(themesWithoutImages.map((record) => `${record.id}: themes require at least one image`).join("\n"));
  process.exit(1);
}
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

const mediaProblems = await checkMediaUrls(records.flatMap((record) => record.listing?.media ?? []));
for (const record of records) {
  for (const url of record.listing?.media ?? []) {
    if (mediaProblems.has(url)) console.error(`${record.id}: media ${url}: ${mediaProblems.get(url)}`);
  }
}
if (mediaProblems.size) process.exit(1);

const client = createNpmClient();
const problems: string[] = [];
for (const record of selected) {
  try {
    const path = `plugins/${record.id}.json`;
    // Historical records use their original schema; validateArtifact compares only their pins.
    const previous = baseFiles.has(path)
      ? JSON.parse(git(["show", `${baseCommit}:${path}`]))
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
