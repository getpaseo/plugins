import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SubmissionIssue } from "./issue.ts";

/** Intake records author intent; only the reviewer creates an approved artifact pin. */
export function writeSubmission(input: SubmissionIssue & {
  issue: number; title: string; submittedBy: string;
}, root = process.cwd()): string {
  const file = `submissions/${input.issue}.json`;
  mkdirSync(join(root, "submissions"), { recursive: true });
  writeFileSync(join(root, file), `${JSON.stringify(input, null, 2)}\n`);
  return file;
}

/** Pending proposals must be replaced by reviewed plugin records before merging. */
export function requireCompletedSubmissions(root = process.cwd()): void {
  const directory = join(root, "submissions");
  if (!existsSync(directory)) return;
  const pending = readdirSync(directory).filter((name) => name.endsWith(".json"));
  if (pending.length) throw new Error(
    `Awaiting reviewer completion: ${pending.map((name) => `submissions/${name}`).join(", ")}. The reviewer resolves the artifact, writes the plugin record and removes the submission file before merging. No author release is required just to complete this step.`,
  );
}
