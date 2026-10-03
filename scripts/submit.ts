import { createHash } from "node:crypto";
import { validateForReview } from "./lib/review.ts";
// Turns a submission issue into a pull request that adds the pinned record.
// Runs from .github/workflows/submit.yml with ISSUE_NUMBER and GH_TOKEN set.
import { pinGit } from "./lib/git-artifact.ts";
import { githubOwner } from "./lib/repository.ts";
import { existsSync } from "node:fs";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { deriveId } from "./lib/id.ts";
import { parseSubmissionIssue } from "./lib/issue.ts";
import { createNpmClient } from "./lib/npm.ts";
import { pinRecord } from "./lib/pin.ts";
import {
  parseRecord,
  readRecords,
  recordPath,
  serializeRecord,
  writeRecord,
} from "./lib/record.ts";
import { gh, ghJson, git } from "./lib/shell.ts";

const issueNumber = process.env.ISSUE_NUMBER;
if (!issueNumber) {
  console.error("ISSUE_NUMBER is required");
  process.exit(2);
}

const issue = ghJson<{ body: string; author: { login: string }; title: string }>([
  "issue",
  "view",
  issueNumber,
  "--json",
  "body,author,title",
]);

const branch = `submit/issue-${issueNumber}`;
const previous = ghJson<Array<{ number: number; state: string; body: string; url: string }>>([
  "pr",
  "list",
  "--head",
  branch,
  "--state",
  "all",
  "--json",
  "number,state,body,url",
])[0];
const revision = `<!-- submission:${issueNumber}:${createHash("sha256").update(issue.body).digest("hex")} -->`;
if (previous && (previous.state !== "OPEN" || previous.body.includes(revision))) {
  console.log(`Submission already processed: ${previous.url}`);
  process.exit(0);
}

function comment(body: string) {
  gh(["issue", "comment", issueNumber!, "--body", body]);
}

try {
  git(["checkout", "--detach", "origin/main"]);
  const categories = readCategories();
  const known = categorySlugs(categories);
  const submission = parseSubmissionIssue(issue.body, categories);
  const id = submission.id ?? deriveId(submission.package);
  const existing = readRecords(known);
  const duplicate = existing.find(
    (record) =>
      (record.artifact.kind === "npm" && record.artifact.package === submission.package) ||
      record.id === id,
  );
  if (duplicate || existsSync(recordPath(id))) {
    throw new Error(
      `\`${submission.package}\` is already listed as \`${duplicate?.id ?? id}\`. Updates are picked up automatically; no issue is needed.`,
    );
  }

  const record = submission.package.startsWith("https://github.com/")
    ? pinGit({
        source: submission.package,
        slug: submission.id,
        pluginPath: submission.pluginPath,
        categories: submission.categories,
        submittedBy: issue.author.login,
      })
    : await pinRecord(createNpmClient(), {
        id,
        package: submission.package,
        categories: submission.categories,
        submittedBy: issue.author.login,
      });
  parseRecord(record, known);
  const owner = githubOwner(record.repository.url)!;
  const proven = record.artifact.kind === "npm" && record.repository.commit;
  if (!proven && owner.toLowerCase() !== issue.author.login.toLowerCase()) {
    try {
      gh(["api", `orgs/${owner}/public_members/${issue.author.login}`]);
    } catch {
      throw new Error(
        `Only @${owner} or a public member of that organization may submit this source without npm provenance.`,
      );
    }
  }
  if (existing.some((item) => item.id === record.id))
    throw new Error(`${record.id} is already listed`);

  git(["checkout", "-B", branch, "origin/main"]);
  writeRecord(record);
  git(["add", recordPath(record.id)]);
  git(["commit", "-m", `Add ${id} (${record.id})`]);
  const validation = validateForReview();
  git(["push", "--force", "--set-upstream", "origin", branch]);

  const provenance =
    record.artifact.kind === "git"
      ? `Git tag \`${record.artifact.tag}\` pins commit \`${record.artifact.commit}\`.`
      : record.repository?.commit
        ? `Provenance verified: built from ${record.repository.url} at \`${record.repository.commit}\`.`
        : "No npm provenance. The repository link is what the package declares; review the tarball, not the repo.";
  const body = [
    `Closes #${issueNumber}. Submitted by @${issue.author.login}.`,
    revision,
    validation,
    "",
    `Pinned \`${record.id}\`.`,
    provenance,
    "",
    "Review the pinned artifact before merging:",
    "```sh",
    `# Artifact: ${JSON.stringify(record.artifact)}`,
    "```",
    "",
    "```json",
    serializeRecord(record).trim(),
    "```",
  ].join("\n");
  if (previous) {
    gh(["pr", "edit", String(previous.number), "--body", body]);
    console.log(`Updated ${previous.url}`);
  } else {
    const url = gh([
      "pr",
      "create",
      "--title",
      `Add ${record.id}`,
      "--body",
      body,
      "--head",
      branch,
      "--base",
      "main",
      "--label",
      "submission",
    ]);
    comment(`Thanks! The listing is in review: ${url}`);
    console.log(url);
  }
} catch (error) {
  const message = (error as Error).message;
  comment(
    `This submission could not be processed: ${message}\n\nEdit the issue to fix it and it will be checked again.`,
  );
  console.error(message);
  process.exit(1);
}
