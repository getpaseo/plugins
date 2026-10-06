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
  const issue = { body, author: { login: "acme" }, title: "Example plugin" };
  const issueFile = join(root, "issue.json");
  const callsFile = join(root, "calls.jsonl");
  const previousFile = join(root, "previous.json");
  writeFileSync(previousFile, "[]");
  writeFileSync(issueFile, JSON.stringify(issue));
  // A local implementation of the gh process interface records issue mutations;
  // the submission command and Git operations run unchanged against real fixtures.
  writeFileSync(join(bin, "gh"), `#!${process.execPath}\nconst fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.SUBMIT_CALLS, JSON.stringify(args) + "\\n");
if (args[0] === "issue" && args[1] === "view") console.log(fs.readFileSync(process.env.SUBMIT_ISSUE, "utf8"));
else if (args[0] === "pr" && args[1] === "list") console.log(fs.readFileSync(process.env.SUBMIT_PREVIOUS, "utf8"));
else if (args[0] === "pr" && args[1] === "create") console.log("https://github.com/acme/registry/pull/1");
else if (args[0] === "pr" && args[1] === "edit") {}
else if (args[0] !== "issue" || !["close", "comment"].includes(args[1])) process.exit(99);
`, { mode: 0o755 });
  const origin = join(root, "origin.git");
  git(root, "init", "--bare", "-q", origin);
  git(registry, "remote", "add", "origin", origin);
  // Real parser tests exercise inline validation without recursively spawning this suite.
  writeFileSync(join(registry, "package.json"), JSON.stringify({ type: "module", scripts: { test: "node --test scripts/lib/issue.test.ts" } }));
  const run = () => spawnSync(process.execPath, ["scripts/submit.ts"], {
    cwd: registry, encoding: "utf8",
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, ISSUE_NUMBER: "42", SUBMIT_CALLS: callsFile, SUBMIT_ISSUE: issueFile, SUBMIT_PREVIOUS: previousFile,
      GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: `url.file://${remote}.insteadOf`, GIT_CONFIG_VALUE_0: "https://github.com/acme/example.git" },
  });
  return { run, issue, issueFile, previousFile, remote, registry, git, calls: () => readFileSync(callsFile, "utf8").trim().split("\n").map((line) => JSON.parse(line)), unchanged: () => assert.equal(readFileSync(recordFile, "utf8"), original) };
}

for (const [name, source] of [
  ["existing npm package", "@acme/paseo-example"],
  ["npm package URL", "https://www.npmjs.com/package/@acme/paseo-example"],
  ["npm install source", "npm:@acme/paseo-example"],
  ["Git id resolved from the pinned source", "https://github.com/acme/example"],
  ["Git install source", "github:acme/example"],
]) {
  test(`submission closes ${name} successfully`, (t) => {
    const f = fixture(t, source);
    if (source.startsWith("https://")) {
      writeFileSync(f.issueFile, JSON.stringify({ ...f.issue, author: { login: "visitor" } }));
    }
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(f.calls().filter((args) => args[0] === "issue" && args[1] !== "view"), [
      ["issue", "close", "42", "--comment", "Already listed: [acme/example](https://paseo.sh/plugins/acme/example)."],
    ]);
    assert.equal(f.calls().some((args) => args[0] === "pr" && args[1] !== "list"), false);
    f.unchanged();
  });
}

test("invalid submissions still report an error and remain open", (t) => {
  const f = fixture(t, "@acme/paseo-example");
  writeFileSync(f.issueFile, JSON.stringify({ ...f.issue, body: "### Source\n@acme/example" }));
  const result = f.run();
  assert.equal(result.status, 1);
  assert.equal(f.calls().some((args) => args[1] === "close"), false);
  assert.match(f.calls().find((args) => args[1] === "comment").at(-1), /no category ticked/);
  f.unchanged();
});

for (const source of ["acme/example", "./plugin"]) {
  test(`submission rejects ${source} with an actionable comment`, (t) => {
    const f = fixture(t, source);
    assert.equal(f.run().status, 1);
    assert.match(f.calls().find((args) => args[1] === "comment").at(-1), /paste the repository or package instead/i);
    assert.equal(f.calls().some((args) => args[1] === "close"), false);
    f.unchanged();
  });
}

for (const source of [
  "https://github.com/acme/example/tree/ignored/plugins/review",
  "acme/example:plugins/review",
]) {
  test(`submission pins the newest tag and derives the id from ${source}`, (t) => {
    const f = fixture(t, source);
    f.git(f.remote, "commit", "--allow-empty", "-qm", "release");
    f.git(f.remote, "tag", "-a", "v2.0.0", "-m", "Release");
    const commit = f.git(f.remote, "rev-parse", "HEAD");
    f.git(f.remote, "commit", "--allow-empty", "-qm", "unreleased");
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    const record = JSON.parse(readFileSync(join(f.registry, "plugins/acme/review.json"), "utf8"));
    assert.equal(record.id, "acme/review");
    assert.equal(record.artifact.pluginPath, "plugins/review");
    assert.equal(record.artifact.tag, "v2.0.0");
    assert.equal(record.artifact.commit, commit);
    assert.equal(record.listing.name, "Example plugin");
    assert.equal(f.calls().some((args) => args[0] === "pr" && args[1] === "create"), true);
    f.unchanged();
  });
}

test("changing only the issue title updates the listing name in its existing PR", (t) => {
  const f = fixture(t, "github:acme/example:plugins/review");
  const first = f.run();
  assert.equal(first.status, 0, first.stderr);
  const created = f.calls().find((args) => args[0] === "pr" && args[1] === "create");
  writeFileSync(f.previousFile, JSON.stringify([{
    number: 1, state: "OPEN", body: created[created.indexOf("--body") + 1],
    url: "https://github.com/acme/registry/pull/1",
  }]));
  writeFileSync(f.issueFile, JSON.stringify({ ...f.issue, title: "Renamed plugin" }));
  const updated = f.run();
  assert.equal(updated.status, 0, updated.stderr);
  const record = JSON.parse(readFileSync(join(f.registry, "plugins/acme/review.json"), "utf8"));
  assert.equal(record.listing.name, "Renamed plugin");
  assert.equal(f.calls().filter((args) => args[0] === "pr" && args[1] === "edit").length, 1);
});
