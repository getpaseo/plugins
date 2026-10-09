// Recover open submissions that have not reached a PR, including older intake failures.
import { spawnSync } from "node:child_process";
import { ghJson } from "./lib/shell.ts";

const issues = ghJson<Array<{ number: number }>>([
  "issue", "list", "--state", "open", "--label", "submission", "--limit", "1000", "--json", "number",
]);
const branches = new Set(ghJson<Array<{ headRefName: string }>>([
  "pr", "list", "--state", "all", "--limit", "1000", "--json", "headRefName",
]).map((pr) => pr.headRefName));
for (const issue of issues.reverse()) {
  if (branches.has(`submit/issue-${issue.number}`)) continue;
  const result = spawnSync(process.execPath, ["scripts/submit.ts"], {
    stdio: "inherit", env: { ...process.env, ISSUE_NUMBER: String(issue.number) },
  });
  if (result.status !== 0) process.exitCode = 1;
}
