// Recover open submissions that have not reached a PR, including older intake failures.
import { spawnSync } from "node:child_process";
import { isSubmissionIssue } from "./lib/issue.ts";
import { ghJson } from "./lib/shell.ts";

const issues = ghJson<Array<{ number: number; body: string; labels: Array<{ name: string }> }>>([
  "issue", "list", "--state", "open", "--limit", "1000", "--json", "number,body,labels",
]);
const branches = new Set(ghJson<Array<{ headRefName: string; state: string }>>([
  "pr", "list", "--state", "all", "--limit", "1000", "--json", "headRefName,state",
]).filter(pr => pr.state === "OPEN" || pr.state === "MERGED").map((pr) => pr.headRefName));
for (const issue of issues.reverse()) {
  if (!issue.labels.some(label => label.name === "submission") && !isSubmissionIssue(issue.body)) continue;
  if (branches.has(`submit/issue-${issue.number}`)) continue;
  const result = spawnSync(process.execPath, ["scripts/submit.ts"], {
    stdio: "inherit", env: { ...process.env, ISSUE_NUMBER: String(issue.number) },
  });
  if (result.status !== 0) process.exitCode = 1;
}
