import { appendFileSync } from "node:fs";
import { AuthorError } from "./lib/problems.ts";
import { validateForReview } from "./lib/review.ts";
// Turns a submission issue into a pull request that adds the pinned record.
// Runs from .github/workflows/submit.yml with ISSUE_NUMBER and GH_TOKEN set.
import { pinGit } from "./lib/git-artifact.ts";
import { githubOwner } from "./lib/repository.ts";
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
if (!issueNumber || !/^[1-9][0-9]*$/.test(issueNumber)) {
  console.error("ISSUE_NUMBER must be a positive issue number");
  process.exit(2);
}

function comment(body: string) {
  gh(["issue", "comment", issueNumber!, "--body", body]);
}

function closeAlreadyListed(id: string): never {
  gh([
    "issue", "close", issueNumber!, "--comment",
    `Already listed: [${id}](https://paseo.sh/plugins/${id}).`,
  ]);
  process.exit(0);
}

try {
  const issue = ghJson<{ body: string; author: { login: string }; title: string; state: string; labels: Array<{ name: string }> }>([
    "issue",
    "view",
    issueNumber,
    "--json",
    "body,author,title,state,labels",
  ]);

  if (issue.state !== "OPEN" || !issue.labels.some((label) => label.name === "submission")) {
    console.log("Only open issues labeled submission can be processed.");
    process.exit(0);
  }

  const branch = `submit/issue-${issueNumber}`;
  const previous = ghJson<Array<{ number: number; state: string; url: string }>>([
    "pr",
    "list",
    "--head",
    branch,
    "--state",
    "all",
    "--json",
    "number,state,url",
  ])[0];
  if (previous && previous.state !== "OPEN") {
    console.log(`Submission already processed: ${previous.url}`);
    process.exit(0);
  }

  git(["checkout", "--detach", "origin/main"]);
  const categories = readCategories();
  const known = categorySlugs(categories);
  const submission = parseSubmissionIssue(issue.body, categories);
  const source = submission.source;
  const existing = readRecords(known);
  const duplicate = existing.find(
    (record) =>
      source.kind === "npm" && record.artifact.kind === "npm" && record.artifact.package === source.package,
  );
  if (duplicate) closeAlreadyListed(duplicate.id);

  const client = createNpmClient();
  const record = source.kind === "git"
    ? pinGit({
        ...source,
        categories: submission.categories,
        submittedBy: issue.author.login,
      })
    : await pinRecord(client, {
        id: deriveId(source.package),
        package: source.package,
        categories: submission.categories,
        submittedBy: issue.author.login,
      });
  record.listing = { name: issue.title.trim() };
  parseRecord(record, known);
  if (existing.some((item) => item.id === record.id)) closeAlreadyListed(record.id);
  const owner = githubOwner(record.repository.url)!;
  const proven = record.artifact.kind === "npm" && record.repository.commit;
  if (!proven && owner.toLowerCase() !== issue.author.login.toLowerCase()) {
    // Only a confirmed 404 means non-membership. A GitHub outage or token error
    // must not turn into an ownership accusation on the submission issue.
    try {
      gh(["api", "--include", `orgs/${owner}/public_members/${issue.author.login}`], {
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      const response = String((error as { stdout?: string }).stdout ?? "");
      if (/^HTTP\/\S+ 404\b/m.test(response)) {
        throw new AuthorError(`Only @${owner} or a public member of that organization may submit this source without npm provenance. Ask the repository owner to submit it, make your organization membership public, or publish the npm package with provenance.`);
      }
      throw error;
    }
  }
  git(["checkout", "-B", branch, "origin/main"]);
  writeRecord(record);
  git(["add", recordPath(record.id)]);
  git(["commit", "-m", `Add ${record.id}`]);
  const validation = await validateForReview({ client, submissionId: record.id });
  git(["push", "--force", "--set-upstream", "origin", branch]);

  const provenance =
    record.artifact.kind === "git"
      ? `Git tag \`${record.artifact.tag}\` pins commit \`${record.artifact.commit}\`.`
      : record.repository?.commit
        ? `Provenance verified: built from ${record.repository.url} at \`${record.repository.commit}\`.`
        : "No npm provenance. The repository link is what the package declares; review the tarball, not the repo.";
  const body = [
    `Closes #${issueNumber}. Submitted by @${issue.author.login}.`,
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
    comment(`Thanks! The listing is in review: ${previous.url}`);
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
  console.error(error);
  if (error instanceof AuthorError) {
    comment(`This submission needs a change before review:\n\n${error.message}\n\nAfter fixing it, ask a maintainer to rerun this submission. Editing the issue does not start another run.`);
  } else {
    const summary = `Submission #${issueNumber} needs a maintainer. No author action was requested.\n\n${(error as Error).message}\n`;
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
    gh(["issue", "edit", issueNumber, "--add-label", "needs-maintainer"]);
  }
  process.exitCode = 1;
}
