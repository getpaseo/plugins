// Pins a package and writes its record. Used by maintainers locally and by submit.ts.
//   node scripts/add.ts <npm package> --categories themes,utils [--id dracula] [--submitted-by login] [--submitted-at YYYY-MM-DD]
import { pinGit, parseGitSource } from "./lib/git-artifact.ts";
import { existsSync } from "node:fs";
import { flagString, parseArgs } from "./lib/args.ts";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { deriveId } from "./lib/id.ts";
import { createNpmClient } from "./lib/npm.ts";
import { pinRecord } from "./lib/pin.ts";
import { parseRecord, readRecords, recordPath, writeRecord } from "./lib/record.ts";

const { positional, flags } = parseArgs(process.argv.slice(2));
const pkg = positional[0]?.replace(/^npm:/, "");
const categories =
  flagString(flags, "categories")
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];
if (!pkg || categories.length === 0) {
  console.error(
    "usage: node scripts/add.ts <npm package> --categories a,b [--id id] [--submitted-by login] [--submitted-at YYYY-MM-DD] [--version x.y.z]",
  );
  process.exit(2);
}

const known = categorySlugs(readCategories());
const id = flagString(flags, "id") ?? deriveId(pkg);
const existing = readRecords(known);
const duplicate = existing.find(
  (record) =>
    (record.artifact.kind === "npm" && record.artifact.package === pkg) || record.id === id,
);
if (duplicate || existsSync(recordPath(id))) {
  console.error(`${pkg} is already listed as "${duplicate?.id ?? id}"`);
  process.exit(1);
}

const source = parseGitSource(pkg, flagString(flags, "plugin-path"));
const record = source
  ? pinGit({
      ...source,
      slug: flagString(flags, "id"),
      categories,
      submittedBy: flagString(flags, "submitted-by"),
    })
  : await pinRecord(
      createNpmClient(),
      { id, package: pkg, categories, submittedBy: flagString(flags, "submitted-by") },
      { version: flagString(flags, "version"), submittedAt: flagString(flags, "submitted-at") },
    );
parseRecord(record, known);
if (existing.some((item) => item.id === record.id))
  throw new Error(`${record.id} is already listed`);
const path = writeRecord(record);
console.log(`${path}: ${record.id}`);
