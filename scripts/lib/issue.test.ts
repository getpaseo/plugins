import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { readCategories } from "./categories.ts";
import { parseSubmissionIssue } from "./issue.ts";
import { parseSubmissionSource } from "./submission-source.ts";

const body = readFileSync(new URL("../fixtures/submission-issue.md", import.meta.url), "utf8");
const parse = (source: string) => parseSubmissionIssue(body.replace("@acme/paseo-review", source), readCategories());

for (const source of [
  "@acme/paseo-review", "paseo-review", "npm:@acme/paseo-review",
  "https://www.npmjs.com/package/@acme/paseo-review",
  "https://github.com/acme/paseo-review", "https://github.com/acme/paseo-review.git/",
  "https://github.com/acme/monorepo/tree/main/plugins/review",
  "github:acme/paseo-review", "git:https://github.com/acme/paseo-review.git",
  "acme/monorepo:plugins/review",
]) {
  test(`reads Source and categories from GitHub's rendered issue: ${source}`, () => {
    assert.deepEqual(parse(source), { source: parseSubmissionSource(source), categories: ["git", "workspaces"] });
  });
}
test("rejects missing Source or categories and registry ids", () => {
  assert.throws(() => parse("_No response_"), /no plugin source/);
  assert.throws(() => parseSubmissionIssue(body.replaceAll("[x]", "[ ]"), readCategories()), /no category/);
  assert.throws(() => parseSubmissionIssue(body.replace("### Source", "### Plugin source"), readCategories()), /no plugin source/);
  assert.throws(() => parse("acme/review"), /paste the repository or package instead/i);
});
