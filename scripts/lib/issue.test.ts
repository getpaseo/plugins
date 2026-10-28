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
test("rejects missing Source and registry ids", () => {
  assert.throws(() => parse("_No response_"), /no plugin source/);
  assert.deepEqual(parseSubmissionIssue(body.replaceAll("[x]", "[ ]"), readCategories()).categories, []);
  assert.throws(() => parseSubmissionIssue(body.replace("### Source", "### Plugin source"), readCategories()), /no plugin source/);
  assert.throws(() => parse("acme/review"), /paste the repository or package instead/i);
});

test("source prose preserves abbreviated refs and prefers an explicit commit over its tag", () => {
  assert.equal(parse("https://github.com/acme/review (ref: eb219a7, v0.5.8)").source.ref, "eb219a7");
  const result = parse("https://github.com/acme/review/tree/v0.1.1/plugins/review\n\nGit reference: `v0.1.1` — commit `f8f57acb22febbe93d0ccd55e57cbc9c8268265e`.");
  assert.deepEqual(result.source, { kind: "git", source: "https://github.com/acme/review", pluginPath: "plugins/review", ref: "f8f57acb22febbe93d0ccd55e57cbc9c8268265e" });
});

test("conflicting commits are an author error instead of silently choosing one", () => {
  assert.throws(() => parse("https://github.com/acme/review#1234567 commit abcdef0"), /different revisions/);
  assert.throws(() => parse("https://github.com/acme/review commit 1234567\ncommit abcdef0"), /conflicting commits/);
});
