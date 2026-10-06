import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, type TestContext } from "node:test";

function fixture(t: TestContext, source: string, listingId = "") {
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
  git(remote, "add", "paseo-plugin.json");
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
  git(registry, "add", "plugins", "categories.json");
  git(registry, "commit", "-qm", "registry");
  git(registry, "update-ref", "refs/remotes/origin/main", "HEAD");
  const issue = { body: `### Plugin source\n${source}\n### Categories\n- [x] Utils\n### Listing ID\n${listingId}`, author: { login: "acme" }, title: "Submit example" };
  const issueFile = join(root, "issue.json");
  const callsFile = join(root, "calls.jsonl");
  writeFileSync(issueFile, JSON.stringify(issue));
  // A local implementation of the gh process interface records issue mutations;
  // the submission command and Git operations run unchanged against real fixtures.
  writeFileSync(join(bin, "gh"), `#!${process.execPath}\nconst fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.SUBMIT_CALLS, JSON.stringify(args) + "\\n");
if (args[0] === "issue" && args[1] === "view") console.log(fs.readFileSync(process.env.SUBMIT_ISSUE, "utf8"));
else if (args[0] === "pr" && args[1] === "list") console.log("[]");
else if (args[0] !== "issue" || !["close", "comment"].includes(args[1])) process.exit(99);
`, { mode: 0o755 });
  const run = () => spawnSync(process.execPath, ["scripts/submit.ts"], {
    cwd: registry, encoding: "utf8",
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, ISSUE_NUMBER: "42", SUBMIT_CALLS: callsFile, SUBMIT_ISSUE: issueFile,
      GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: `url.file://${remote}.insteadOf`, GIT_CONFIG_VALUE_0: "https://github.com/acme/example.git" },
  });
  return { run, issue, issueFile, calls: () => readFileSync(callsFile, "utf8").trim().split("\n").map((line) => JSON.parse(line)), unchanged: () => assert.equal(readFileSync(recordFile, "utf8"), original) };
}

for (const [name, source, id] of [
  ["existing npm package", "@acme/paseo-example", ""],
  ["explicit existing id", "@acme/another-package", "acme/example"],
  ["Git id resolved from the pinned source", "https://github.com/acme/example", ""],
]) {
  test(`submission closes ${name} successfully`, (t) => {
    const f = fixture(t, source, id);
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
  writeFileSync(f.issueFile, JSON.stringify({ ...f.issue, body: "### Plugin source\n@acme/example" }));
  const result = f.run();
  assert.equal(result.status, 1);
  assert.equal(f.calls().some((args) => args[1] === "close"), false);
  assert.match(f.calls().find((args) => args[1] === "comment").at(-1), /no category ticked/);
  f.unchanged();
});
