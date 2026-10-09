import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, type TestContext } from "node:test";

function fixture(t: TestContext, source: string) {
  const root = mkdtempSync(join(tmpdir(), "registry-submit-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const registry = join(root, "registry");
  const remote = join(root, "remote");
  const bin = join(root, "bin");
  for (const path of [registry, remote, bin]) mkdirSync(path);
  cpSync(fileURLToPath(new URL(".", import.meta.url)), join(registry, "scripts"), { recursive: true });
  const git = (cwd: string, ...args: string[]) => {
    const result = spawnSync("git", args, { cwd, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  for (const cwd of [registry, remote]) {
    git(cwd, "init", "-q");
    git(cwd, "config", "user.name", "Test");
    git(cwd, "config", "user.email", "test@example.com");
  }
  writeFileSync(join(remote, "paseo-plugin.json"), '{"id":"example","name":"Example"}');
  writeFileSync(join(remote, "OVERVIEW.md"), "A fixture plugin.");
  mkdirSync(join(remote, "plugins/review"), { recursive: true });
  cpSync(join(remote, "paseo-plugin.json"), join(remote, "plugins/review/paseo-plugin.json"));
  cpSync(join(remote, "OVERVIEW.md"), join(remote, "plugins/review/OVERVIEW.md"));
  git(remote, "add", ".");
  git(remote, "commit", "-qm", "fixture");
  git(remote, "tag", "v1.0.0");
  const record = {
    id: "acme/example",
    artifact: { kind: "npm", package: "@acme/paseo-example", version: "1.0.0", resolved: "https://registry.npmjs.org/example.tgz", integrity: "sha512-fixture" },
    repository: { url: "https://github.com/acme/example" },
    categories: ["utils"], submittedAt: "2026-10-06", reviewedAt: "2026-10-06",
  };
  mkdirSync(join(registry, "plugins/acme"), { recursive: true });
  const recordFile = join(registry, "plugins/acme/example.json");
  const original = JSON.stringify(record);
  writeFileSync(recordFile, original);
  cpSync(fileURLToPath(new URL("../categories.json", import.meta.url)), join(registry, "categories.json"));
  writeFileSync(join(registry, "featured.json"), "[]\n");
  git(registry, "add", "plugins", "categories.json");
  git(registry, "commit", "-qm", "registry");
  git(registry, "update-ref", "refs/remotes/origin/main", "HEAD");
  const body = readFileSync(new URL("fixtures/submission-issue.md", import.meta.url), "utf8")
    .replace("@acme/paseo-review", source);
  const issue = { body, author: { login: "acme" }, title: "Example plugin", state: "OPEN", labels: [{ name: "submission" }] };
  const issueFile = join(root, "issue.json");
  const callsFile = join(root, "calls.jsonl");
  const previousFile = join(root, "previous.json");
  const membershipFile = join(root, "membership-status");
  const summaryFile = join(root, "summary.md");
  writeFileSync(membershipFile, "204");
  writeFileSync(previousFile, "[]");
  writeFileSync(issueFile, JSON.stringify(issue));
  // A local implementation of the gh process interface records issue mutations;
  // the submission command and Git operations run unchanged against real fixtures.
  writeFileSync(join(bin, "gh"), `#!${process.execPath}\nconst fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.SUBMIT_CALLS, JSON.stringify(args) + "\\n");
if (args[0] === "issue" && args[1] === "list") console.log(JSON.stringify([{ number: 42 }]));
else if (args[0] === "issue" && args[1] === "view") console.log(fs.readFileSync(process.env.SUBMIT_ISSUE, "utf8"));
else if (args[0] === "pr" && args[1] === "list") console.log(fs.readFileSync(process.env.SUBMIT_PREVIOUS, "utf8"));
else if (args[0] === "pr" && args[1] === "create") console.log("https://github.com/acme/registry/pull/1");
else if (args[0] === "pr" && args[1] === "edit") {}
else if (args[0] === "api") {
  const status = Number(fs.readFileSync(process.env.SUBMIT_MEMBERSHIP, "utf8"));
  console.log("HTTP/2.0 " + status);
  process.exit(status === 204 ? 0 : 1);
}
else if (args[0] !== "issue" || !["close", "comment", "edit"].includes(args[1])) process.exit(99);
`, { mode: 0o755 });
  const origin = join(root, "origin.git");
  git(root, "init", "--bare", "-q", origin);
  git(registry, "remote", "add", "origin", origin);
  // Real parser tests exercise inline validation without recursively spawning this suite.
  writeFileSync(join(registry, "package.json"), JSON.stringify({ type: "module", scripts: { test: "node --test scripts/lib/issue.test.ts" } }));
  const run = (script = "submit") => spawnSync(process.execPath, [`scripts/${script}.ts`], {
    cwd: registry, encoding: "utf8",
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, ISSUE_NUMBER: "42", SUBMIT_CALLS: callsFile, SUBMIT_ISSUE: issueFile, SUBMIT_PREVIOUS: previousFile, SUBMIT_MEMBERSHIP: membershipFile, GITHUB_STEP_SUMMARY: summaryFile,
      GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: `url.file://${remote}.insteadOf`, GIT_CONFIG_VALUE_0: "https://github.com/acme/example.git" },
  });
  return { run, issue, issueFile, previousFile, membershipFile, summaryFile, remote, registry, git, calls: () => readFileSync(callsFile, "utf8").trim().split("\n").map((line) => JSON.parse(line)), unchanged: () => assert.equal(readFileSync(recordFile, "utf8"), original) };
}


for (const source of [
  "https://github.com/acme/example",
  "https://github.com/acme/example/tree/1234567890123456789012345678901234567890/plugins/review",
  "github:acme/example#v1.0.0",
  "npm:@acme/paseo-example",
]) {
  test(`intake opens a review proposal without artifact or ownership gates: ${source}`, (t) => {
    const f = fixture(t, source);
    // No remote, invalid unrelated registry data, and no org membership:
    // none of these should prevent opening the review.
    rmSync(f.remote, { recursive: true });
    writeFileSync(join(f.registry, "plugins/acme/example.json"), "broken unrelated record");
    writeFileSync(f.membershipFile, "404");
    writeFileSync(f.issueFile, JSON.stringify({ ...f.issue, author: { login: "visitor" } }));
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    const proposal = JSON.parse(readFileSync(join(f.registry, "submissions/42.json"), "utf8"));
    assert.equal(proposal.submittedBy, "visitor");
    assert.equal(proposal.title, "Example plugin");
    if (source.includes("/tree/")) assert.equal(proposal.source.ref, "1234567890123456789012345678901234567890");
    else if (source.includes("#")) assert.equal(proposal.source.ref, "v1.0.0");
    else assert.equal(proposal.source.ref, undefined);
    assert.equal(f.calls().some((a) => a[0] === "pr" && a[1] === "create"), true);
    assert.equal(f.calls().some((a) => a[0] === "api" || a.includes("needs-maintainer")), false);
  });
}

test("missing categories are completed by the reviewer", (t) => {
  const f = fixture(t, "github:acme/example");
  writeFileSync(f.issueFile, JSON.stringify({ ...f.issue, body: "### Source\nhttps://github.com/acme/example" }));
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(readFileSync(join(f.registry, "submissions/42.json"), "utf8")).categories, []);
});

test("missing source gets a clear correction without asking for a maintainer", (t) => {
  const f = fixture(t, "github:acme/example");
  writeFileSync(f.issueFile, JSON.stringify({ ...f.issue, body: "### Source\n_No response_" }));
  assert.equal(f.run().status, 1);
  const comment = f.calls().find((a) => a[1] === "comment").at(-1);
  assert.match(comment, /source/i);
  assert.doesNotMatch(comment, /maintainer|release tag/i);
  assert.equal(f.calls().some((a) => a.includes("needs-maintainer")), false);
});

test("reruns preserve reviewer edits on an existing PR", (t) => {
  const f = fixture(t, "github:acme/example");
  assert.equal(f.run().status, 0);
  const head = f.git(f.registry, "rev-parse", "HEAD");
  writeFileSync(f.previousFile, JSON.stringify([{ number: 1, state: "OPEN", url: "https://github.com/acme/registry/pull/1" }]));
  writeFileSync(f.issueFile, JSON.stringify({ ...f.issue, title: "New title" }));
  assert.equal(f.run().status, 0);
  assert.equal(f.git(f.registry, "rev-parse", "HEAD"), head);
  assert.equal(f.calls().filter((a) => a[0] === "pr" && a[1] === "create").length, 1);
});

test("unreviewed submissions cannot be published as approved listings", (t) => {
  const f = fixture(t, "github:acme/example");
  assert.equal(f.run().status, 0);
  const result = spawnSync(process.execPath, ["scripts/build.ts"], { cwd: f.registry, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /review.*submission|submission.*review/i);
});

for (const scenario of ["closed issue", "missing label", "closed PR", "merged PR"]) {
  test(`intake leaves a ${scenario} alone`, (t) => {
    const f = fixture(t, "github:acme/example");
    if (scenario === "closed issue") writeFileSync(f.issueFile, JSON.stringify({ ...f.issue, state: "CLOSED" }));
    if (scenario === "missing label") writeFileSync(f.issueFile, JSON.stringify({ ...f.issue, labels: [] }));
    if (scenario.endsWith("PR")) writeFileSync(f.previousFile, JSON.stringify([{ number: 1, state: scenario === "closed PR" ? "CLOSED" : "MERGED", url: "https://github.com/acme/registry/pull/1" }]));
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(f.calls().every((a) => a[1] === "view" || a[1] === "list"), true);
  });
}


test("recovery opens waiting submissions and skips branches already in review", (t) => {
  const f = fixture(t, "github:acme/example");
  assert.equal(f.run("retry-submissions").status, 0);
  writeFileSync(f.previousFile, JSON.stringify([{ headRefName: "submit/issue-42" }]));
  assert.equal(f.run("retry-submissions").status, 0);
  assert.equal(f.calls().filter((a) => a[0] === "pr" && a[1] === "create").length, 1);
});

test("service failures acknowledge the submitter without a maintainer hold", (t) => {
  const f = fixture(t, "github:acme/example");
  f.git(f.registry, "remote", "set-url", "origin", "/nonexistent-intake-test-remote");
  const result = f.run();
  assert.notEqual(result.status, 0);
  const message = f.calls().find((a) => a[1] === "comment").at(-1);
  assert.match(message, /retry automatically/);
  assert.doesNotMatch(message, /needs.maintainer|Command failed/);
  assert.equal(f.calls().some((a) => a.includes("needs-maintainer")), false);
});

test("repeated invalid input does not repeat the same author request", (t) => {
  const f = fixture(t, "github:acme/example");
  const issue = { ...f.issue, body: "### Source\n_No response_" };
  writeFileSync(f.issueFile, JSON.stringify(issue));
  assert.equal(f.run().status, 1);
  const message = f.calls().find((a) => a[1] === "comment").at(-1);
  writeFileSync(f.issueFile, JSON.stringify({ ...issue, comments: [{ body: message }] }));
  assert.equal(f.run().status, 1);
  assert.equal(f.calls().filter((a) => a[1] === "comment").length, 1);
});
