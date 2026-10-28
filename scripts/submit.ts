// Intake records a source for review. Artifact checks belong to the reviewer.
import { AuthorError } from "./lib/problems.ts";
import { readCategories } from "./lib/categories.ts";
import { isSubmissionIssue, parseSubmissionIssue } from "./lib/issue.ts";
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
  if (issue.state !== "OPEN" || (!issue.labels.some((label) => label.name === "submission") && !isSubmissionIssue(issue.body))) process.exit(0);
  if (!issue.labels.some((label) => label.name === "submission"))
    gh(["issue", "edit", issueNumber, "--add-label", "submission"]);
  const branch = `submit/issue-${issueNumber}`;
  const previous = ghJson<Array<{ number: number; state: string; url: string; closedAt: string | null }>>([
    "pr", "list", "--head", branch, "--state", "all", "--json", "number,state,url,closedAt",
  ]).sort((a, b) => b.number - a.number);
  const active = previous.find(pr => pr.state !== "CLOSED");
  const latest = previous[0];
  // The reviewer owns the branch once a PR exists. Read later author edits from the issue.
  if (active) {
    console.log(`Already in review: ${active.url}`);
    process.exit(0);
  }
  if (latest) {
    const result = ghJson<{ data: { repository: { issue: {
      lastEditedAt: string | null;
      comments: { nodes: Array<{ createdAt: string; author: { __typename: string } | null }> };
    } } } }>(["api", "graphql", "-F", `number=${issueNumber}`, "-f", `query=query($number:Int!){repository(owner:"getpaseo",name:"plugins"){issue(number:$number){lastEditedAt comments(last:100){nodes{createdAt author{__typename}}}}}}`]);
    const activity = result.data.repository.issue;
    const dates = [activity.lastEditedAt, ...activity.comments.nodes
      .filter(c => c.author?.__typename === "User").map(c => c.createdAt)];
    if (!latest.closedAt || !dates.some(date => date && date > latest.closedAt!)) process.exit(0);
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
