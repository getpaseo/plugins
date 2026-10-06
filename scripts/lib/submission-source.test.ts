import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSubmissionSource } from "./submission-source.ts";

for (const source of [
  "https://github.com/acme/paseo-review", "https://github.com/acme/paseo-review/",
  "https://github.com/acme/paseo-review.git", "https://github.com/acme/paseo-review.git/",
  "github:acme/paseo-review", "git:acme/paseo-review",
  "git:https://github.com/acme/paseo-review.git", "git://github.com/acme/paseo-review.git",
  "git:ssh://git@github.com/acme/paseo-review.git", "git@github.com:acme/paseo-review.git",
]) {
  test(`Git source: ${source}`, () => {
    assert.deepEqual(parseSubmissionSource(source), { kind: "git", source: "https://github.com/acme/paseo-review" });
  });
}
for (const source of [
  "https://github.com/acme/monorepo/tree/main/plugins/review",
  "https://github.com/acme/monorepo/tree/ignored/plugins/review/",
  "acme/monorepo:plugins/review", "github:acme/monorepo:plugins/review",
  "git:acme/monorepo:plugins/review", "git:https://github.com/acme/monorepo.git:plugins/review",
  "https://github.com/acme/monorepo:plugins/review", "git@github.com:acme/monorepo.git:plugins/review",
]) {
  test(`nested Git source: ${source}`, () => {
    assert.deepEqual(parseSubmissionSource(source), { kind: "git", source: "https://github.com/acme/monorepo", pluginPath: "plugins/review" });
  });
}
for (const source of ["@acme/paseo-review", "npm:@acme/paseo-review", "https://www.npmjs.com/package/@acme/paseo-review"]) {
  test(`npm source: ${source}`, () => {
    assert.deepEqual(parseSubmissionSource(source), { kind: "npm", package: "@acme/paseo-review" });
  });
}
test("bare unscoped npm packages", () => {
  assert.deepEqual(parseSubmissionSource("paseo-review"), { kind: "npm", package: "paseo-review" });
});
for (const source of ["acme/review", "plugins.example.com/acme/review", "./plugin", "../plugin", "/plugins/review", "~/plugin", "C:\\plugins\\review", "git:file:///plugins/review"]) {
  test(`rejects registry ids and directories: ${source}`, () => {
    assert.throws(() => parseSubmissionSource(source), /paste the repository or package instead/i);
  });
}
for (const source of [
  "npm:paseo-review@1.0.0", "@acme/paseo-review@latest",
  "github:acme/review#v1", "git:https://github.com/acme/review#main",
  "https://www.npmjs.com/package/paseo-review/v/1.0.0",
  "acme/review:../escape", "https://github.com/acme/review/tree/main/../escape",
]) {
  test(`rejects a revision or invalid path: ${source}`, () => {
    assert.throws(() => parseSubmissionSource(source));
  });
}
