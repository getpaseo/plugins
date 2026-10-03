import { validateForReview } from "./lib/review.ts";
// Opens one pull request per plugin whose npm latest is newer than the pinned version.
// Runs from .github/workflows/bump.yml twice daily. Each PR carries the tarball diff for review.
import { latestTag, withGitArtifact } from "./lib/git-artifact.ts";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { createNpmClient, resolveVersion } from "./lib/npm.ts";
import { repinRecord } from "./lib/pin.ts";
import {
  type PluginRecord,
  parseRecord,
  readRecords,
  recordPath,
  writeRecord,
} from "./lib/record.ts";
import { gh, git, run } from "./lib/shell.ts";

const DIFF_LIMIT = 60_000;
const TMP = join(process.cwd(), ".tmp");
const dryRun = process.argv.includes("--dry-run");

const known = categorySlugs(readCategories());
const client = createNpmClient();
const records = readRecords(known);
const openBranches = dryRun
  ? new Set<string>()
  : new Set(
      JSON.parse(
        gh(["pr", "list", "--state", "open", "--json", "headRefName", "--limit", "200"]),
      ).map((pr: { headRefName: string }) => pr.headRefName),
    );

mkdirSync(join(TMP, "diffs"), { recursive: true });
let opened = 0;

for (const record of records) {
  const artifact = record.artifact;
  let next: PluginRecord;
  let latest: string;
  let diff: string;
  if (artifact.kind === "npm") {
    const packument = await client.packument(artifact.package);
    latest = packument["dist-tags"].latest;
    if (latest === artifact.version) continue;
    next = await repinRecord(client, record, latest);
    diff = await tarballDiff(record, resolveVersion(packument, latest).dist.tarball);
  } else {
    const pin = latestTag(artifact.remote);
    if (pin.commit === artifact.commit) continue;
    latest = pin.tag;
    next = {
      ...record,
      artifact: { ...artifact, ...pin },
      repository: { ...record.repository, commit: pin.commit },
      reviewedAt: new Date().toISOString().slice(0, 10),
    };
    diff = withGitArtifact(next, (directory) =>
      run("git", ["diff", artifact.commit, pin.commit, "--", "."], { cwd: directory }),
    );
  }
  const branch = `bump/${record.id}-${latest}`;
  if (openBranches.has(branch)) continue;
  parseRecord(next, known);
  mkdirSync(dirname(join(TMP, "diffs", `${record.id}-${latest}.diff`)), { recursive: true });
  writeFileSync(join(TMP, "diffs", `${record.id}-${latest}.diff`), diff);
  if (dryRun) {
    console.log(bumpBody(record, next, diff));
    continue;
  }

  git(["checkout", "-B", branch, "origin/main"]);
  writeRecord(next);
  git(["add", recordPath(record.id)]);
  git(["commit", "-m", `Bump ${record.id} to ${latest}`]);
  const validation = validateForReview();
  git(["push", "--force", "--set-upstream", "origin", branch]);
  gh([
    "pr",
    "create",
    "--title",
    `Bump ${record.id} to ${latest}`,
    "--body",
    `${bumpBody(record, next, diff)}\n\n${validation}`,
    "--head",
    branch,
    "--base",
    "main",
    "--label",
    "bump",
  ]);
  git(["checkout", "main"]);
  opened += 1;
}
console.log(`${opened} bump PR(s) opened`);

async function tarballDiff(record: PluginRecord, nextTarball: string): Promise<string> {
  if (record.artifact.kind !== "npm") throw new Error("Expected npm artifact");
  const current = record.artifact.resolved;
  const dir = mkdtempSync(join(TMP, "diff-"));
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
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function bumpBody(previous: PluginRecord, next: PluginRecord, diff: string): string {
  const truncated = diff.length > DIFF_LIMIT;
  const provenance =
    next.artifact.kind === "git"
      ? `Git tag \`${next.artifact.tag}\` pins commit \`${next.artifact.commit}\`.`
      : next.repository?.commit
        ? `Provenance verified: built from ${next.repository.url} at \`${next.repository.commit}\`.`
        : "No npm provenance for this version. Review the tarball diff below, not the repository.";
  return [
    `\`${next.id}\`: ${JSON.stringify(previous.artifact)} -> ${JSON.stringify(next.artifact)}`,
    provenance,
    previous.submittedBy
      ? `Submitted by @${previous.submittedBy}.`
      : "Original submitter is not recorded; refer to the source owner.",
    "",
    "Merging approves this version. The published index keeps pointing at the previous one until then.",
    "",
    `<details><summary>Artifact diff${truncated ? " (truncated; the full diff is in the workflow artifact)" : ""}</summary>`,
    "",
    "```diff",
    truncated ? diff.slice(0, DIFF_LIMIT) : diff || "(no file changes)",
    "```",
    "",
    "</details>",
  ].join("\n");
}
