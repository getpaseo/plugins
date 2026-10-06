// Checks every record offline, and with --online checks pinned versions against npm.
//   node scripts/validate.ts [--online] [--changed]   (--changed limits online checks to records changed vs origin/main)
import { withGitArtifact } from "./lib/git-artifact.ts";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { createNpmClient, resolveVersion } from "./lib/npm.ts";
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
    if (record.artifact.kind === "git") {
      withGitArtifact(record, () => undefined);
      continue;
    }
    const artifact = record.artifact;
    const packument = await client.packument(artifact.package);
    const doc = resolveVersion(packument, artifact.version);
    if (doc.dist.tarball !== artifact.resolved)
      problems.push(`${record.id}: tarball URL differs from pin`);
    if (doc.dist.integrity !== artifact.integrity)
      problems.push(`${record.id}: integrity does not match npm for ${artifact.version}`);
    if ((await client.file(doc.name, doc.version, "paseo-plugin.json")) === null) {
      problems.push(`${record.id}: ${artifact.version} does not ship paseo-plugin.json`);
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
console.log(`${selected.length} record(s) match their pinned artifacts`);
