// Intake records a source for review. Artifact checks belong to the reviewer.
import { AuthorError } from "./lib/problems.ts";
import { readCategories } from "./lib/categories.ts";
import { parseSubmissionIssue } from "./lib/issue.ts";
import { writeSubmission } from "./lib/submission.ts";
import { gh, ghJson, git } from "./lib/shell.ts";

const issueNumber = process.env.ISSUE_NUMBER;
if (!issueNumber || !/^[1-9][0-9]*$/.test(issueNumber)) {
  console.error("ISSUE_NUMBER must be a positive issue number");
  process.exit(2);
}
let comments: Array<{ body: string }> = [];
function comment(body: string) {
  if (!comments.some((entry) => entry.body === body))
    gh(["issue", "comment", issueNumber!, "--body", body]);
}
try {
  const issue = ghJson<{
    body: string; author: { login: string }; title: string; state: string;
    labels: Array<{ name: string }>; comments?: Array<{ body: string }>;
  }>(["issue", "view", issueNumber, "--json", "body,author,title,state,labels,comments"]);
  comments = issue.comments ?? [];
  if (issue.state !== "OPEN" || !issue.labels.some((label) => label.name === "submission")) process.exit(0);
  const branch = `submit/issue-${issueNumber}`;
  const previous = ghJson<Array<{ number: number; state: string; url: string }>>([
    "pr", "list", "--head", branch, "--state", "all", "--json", "number,state,url",
  ])[0];
  // The reviewer owns the branch once a PR exists. Read later author edits from the issue.
  if (previous) {
    console.log(`Already in review: ${previous.url}`);
    process.exit(0);
  }
  const submission = parseSubmissionIssue(issue.body, readCategories());
  git(["checkout", "-B", branch, "origin/main"]);
  const file = writeSubmission({
    issue: Number(issueNumber), title: issue.title, submittedBy: issue.author.login, ...submission,
  });
  git(["add", file]);
  git(["commit", "-m", `Submit plugin from issue #${issueNumber}`]);
  git(["push", "--force-with-lease", "--set-upstream", "origin", branch]);
  const body = [
    `Closes #${issueNumber}. Submitted by @${issue.author.login}.`, "",
    "Ready for artifact review. The reviewer will resolve the submitted source and complete the registry listing.",
    "", `Submission: \`${file}\`.`,
    "Git references are optional. Use a supplied reference; otherwise resolve main during review. Git updates are submitted manually.",
  ].join("\n");
  const url = gh(["pr", "create", "--title", `Review ${issue.title}`, "--body", body,
    "--head", branch, "--base", "main", "--label", "submission"]);
  if (issue.labels.some((label) => label.name === "needs-maintainer"))
    gh(["issue", "edit", issueNumber, "--remove-label", "needs-maintainer"]);
  comment(`@${issue.author.login}, your submission is ready for review: ${url}`);
  console.log(url);
} catch (error) {
  console.error(error);
  comment(error instanceof AuthorError
    ? `${error.message}\n\nEdit this issue and intake will retry automatically.`
    : "I couldn't open the review PR because intake encountered a service error. It will retry automatically; no changes are needed from you.");
  process.exitCode = 1;
}
