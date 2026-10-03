// Turns a submission issue into a pull request that adds the pinned record.
// Runs from .github/workflows/submit.yml with ISSUE_NUMBER and GH_TOKEN set.
import { existsSync } from "node:fs";
import { categorySlugs, readCategories } from "./lib/categories.ts";
import { deriveId } from "./lib/id.ts";
import { parseSubmissionIssue } from "./lib/issue.ts";
import { createNpmClient } from "./lib/npm.ts";
import { pinRecord } from "./lib/pin.ts";
import { parseRecord, readRecords, recordPath, serializeRecord, writeRecord } from "./lib/record.ts";
import { gh, ghJson, git } from "./lib/shell.ts";

const issueNumber = process.env.ISSUE_NUMBER;
if (!issueNumber) {
  console.error("ISSUE_NUMBER is required");
  process.exit(2);
}

const issue = ghJson<{ body: string; author: { login: string }; title: string }>([
  "issue", "view", issueNumber, "--json", "body,author,title",
]);

function comment(body: string) {
  gh(["issue", "comment", issueNumber!, "--body", body]);
}

try {
  const categories = readCategories();
  const known = categorySlugs(categories);
  const submission = parseSubmissionIssue(issue.body, categories);
  const id = submission.id ?? deriveId(submission.package);
  const existing = readRecords(known);
  const duplicate = existing.find((record) => record.package === submission.package || record.id === id);
  if (duplicate || existsSync(recordPath(id))) {
    throw new Error(`\`${submission.package}\` is already listed as \`${duplicate?.id ?? id}\`. Updates are picked up automatically; no issue is needed.`);
  }

  const record = await pinRecord(createNpmClient(), {
    id,
    package: submission.package,
    categories: submission.categories,
    submittedBy: issue.author.login,
  });
  parseRecord(record, known);

  const branch = `submit/${id}`;
  git(["checkout", "-B", branch]);
  writeRecord(record);
  git(["add", recordPath(id)]);
  git(["commit", "-m", `Add ${id} (${record.package}@${record.version})`]);
  git(["push", "--force", "--set-upstream", "origin", branch]);

  const provenance = record.repository?.commit
    ? `Provenance verified: built from ${record.repository.url} at \`${record.repository.commit}\`.`
    : "No npm provenance. The repository link is what the package declares; review the tarball, not the repo.";
  const body = [
    `Closes #${issueNumber}. Submitted by @${issue.author.login}.`,
    "",
    `Pinned \`${record.package}@${record.version}\`.`,
    provenance,
    "",
    "Review the published tarball before merging:",
    "```sh",
    `npm pack ${record.package}@${record.version} && tar -tzf *.tgz`,
    "```",
    "",
    "```json",
    serializeRecord(record).trim(),
    "```",
  ].join("\n");
  const url = gh([
    "pr", "create",
    "--title", `Add ${id} (${record.package}@${record.version})`,
    "--body", body,
    "--head", branch,
    "--label", "submission",
  ]);
  comment(`Thanks! The listing is in review: ${url}`);
  console.log(url);
} catch (error) {
  const message = (error as Error).message;
  comment(`This submission could not be processed: ${message}\n\nEdit the issue to fix it and it will be checked again.`);
  console.error(message);
  process.exit(1);
}
