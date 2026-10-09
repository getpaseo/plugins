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
    assert.deepEqual(parseSubmissionSource(source), { kind: "git", source: "https://github.com/acme/monorepo", pluginPath: "plugins/review", ...(source.includes("/tree/") ? { ref: source.split("/tree/")[1].split("/")[0] } : {}) });
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
  "acme/review:../escape", "https://github.com/acme/review/tree/main/../escape",
]) {
  test(`rejects a revision or invalid path: ${source}`, () => {
    assert.throws(() => parseSubmissionSource(source));
  });
}


test("preserves explicit Git and npm revisions", () => {
  assert.deepEqual(parseSubmissionSource("github:acme/review#v1"), { kind: "git", source: "https://github.com/acme/review", ref: "v1" });
  assert.deepEqual(parseSubmissionSource("npm:@acme/review@1.2.3"), { kind: "npm", package: "@acme/review", version: "1.2.3" });
  assert.deepEqual(parseSubmissionSource("https://www.npmjs.com/package/review/v/1.2.3"), { kind: "npm", package: "review", version: "1.2.3" });
});
