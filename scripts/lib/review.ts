import { run } from "./shell.ts";

/** Run the same checks as Validate before a default-token bot PR is opened. */
export function validateForReview(): string {
  console.log(run("npm", ["test"]));
  console.log(run(process.execPath, ["scripts/validate.ts", "--online", "--changed"]));
  return "Inline validation passed: `npm test` and `node scripts/validate.ts --online --changed`. The default GITHUB_TOKEN does not trigger the PR validation workflow.";
}
