// Opens one pull request per plugin whose npm latest is newer than the pinned version.
// Runs from .github/workflows/bump.yml daily. Each PR carries the tarball diff for review.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { createNpmClient, resolveVersion } from "./lib/npm.ts";
import { repinRecord } from "./lib/pin.ts";
import { type PluginRecord, parseRecord, readRecords, recordPath, writeRecord } from "./lib/record.ts";
import { gh, git, run } from "./lib/shell.ts";

const DIFF_LIMIT = 60_000;
const TMP = join(process.cwd(), ".tmp");
const dryRun = process.argv.includes("--dry-run");

const known = categorySlugs(readCategories());
const client = createNpmClient();
const records = readRecords(known);
const openBranches = dryRun ? new Set<string>() : new Set(
  JSON.parse(gh(["pr", "list", "--state", "open", "--json", "headRefName", "--limit", "200"])) 
    .map((pr: { headRefName: string }) => pr.headRefName),
);

mkdirSync(join(TMP, "diffs"), { recursive: true });
let opened = 0;

for (const record of records) {
  const packument = await client.packument(record.package);
  const latest = packument["dist-tags"].latest;
  if (latest === record.version) continue;
  const branch = `bump/${record.id}-${latest}`;
  if (openBranches.has(branch)) {
    console.log(`${record.id}: ${latest} already has an open PR`);
    continue;
  }
  console.log(`${record.id}: ${record.version} -> ${latest}`);
  const next = await repinRecord(client, record, latest);
  parseRecord(next, known);
  const diff = await tarballDiff(record, resolveVersion(packument, latest).dist.tarball);
  writeFileSync(join(TMP, "diffs", `${record.id}-${latest}.diff`), diff);
  if (dryRun) continue;

  git(["checkout", "-B", branch, "origin/main"]);
  writeRecord(next);
  git(["add", recordPath(record.id)]);
  git(["commit", "-m", `Bump ${record.id} to ${latest}`]);
  git(["push", "--force", "--set-upstream", "origin", branch]);
  gh([
    "pr", "create",
    "--title", `Bump ${record.id} to ${latest}`,
    "--body", bumpBody(record, next, diff),
    "--head", branch,
    "--base", "main",
    "--label", "bump",
  ]);
  git(["checkout", "main"]);
  opened += 1;
}
console.log(`${opened} bump PR(s) opened`);

async function tarballDiff(record: PluginRecord, nextTarball: string): Promise<string> {
  const packument = await client.packument(record.package);
  const current = resolveVersion(packument, record.version).dist.tarball;
  const dir = join(TMP, record.id);
  mkdirSync(join(dir, "a"), { recursive: true });
  mkdirSync(join(dir, "b"), { recursive: true });
  await client.tarball(current, join(dir, "a.tgz"));
  await client.tarball(nextTarball, join(dir, "b.tgz"));
  run("tar", ["-xzf", join(dir, "a.tgz"), "-C", join(dir, "a")]);
  run("tar", ["-xzf", join(dir, "b.tgz"), "-C", join(dir, "b")]);
  try {
    return run("diff", ["-ruN", "a", "b"], { cwd: dir });
  } catch (error) {
    // diff exits 1 when the trees differ, which is the expected case.
    const stdout = (error as { stdout?: Buffer | string }).stdout;
    if (stdout !== undefined) return stdout.toString().trim();
    throw error;
  }
}

function bumpBody(previous: PluginRecord, next: PluginRecord, diff: string): string {
  const truncated = diff.length > DIFF_LIMIT;
  const provenance = next.repository?.commit
    ? `Provenance verified: built from ${next.repository.url} at \`${next.repository.commit}\`.`
    : "No npm provenance for this version. Review the tarball diff below, not the repository.";
  return [
    `\`${next.package}\`: ${previous.version} -> ${next.version}`,
    provenance,
    "",
    "Merging approves this version. The published index keeps pointing at the previous one until then.",
    "",
    `<details><summary>Tarball diff${truncated ? " (truncated; the full diff is in the workflow artifact)" : ""}</summary>`,
    "",
    "```diff",
    truncated ? diff.slice(0, DIFF_LIMIT) : diff || "(no file changes)",
    "```",
    "",
    "</details>",
  ].join("\n");
}
