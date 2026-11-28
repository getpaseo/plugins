import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { test, type TestContext } from "node:test";
import { serializeRecord, type PluginRecord } from "./record.ts";

const VALID_TIMESTAMP = "2026-04-01T00:00:00Z";

function makeRecord(id: string, commit: string, overrides: Partial<PluginRecord> = {}): PluginRecord {
  const [owner, slug] = id.split("/");
  return {
    id,
    artifact: {
      kind: "git",
      remote: `https://github.com/${owner}/${slug}.git`,
      commit,
    },
    repository: {
      url: `https://github.com/${owner}/${slug}`,
      commit,
    },
    categories: ["utils"],
    submittedAt: VALID_TIMESTAMP,
    submittedBy: owner,
    publishedAt: VALID_TIMESTAMP,
    reviewedAt: VALID_TIMESTAMP,
    ...overrides,
  };
}

function createFixture(t: TestContext) {
  const root = mkdtempSync(join(tmpdir(), "registry-validate-changed-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const remote = join(root, "remote");
  const registry = join(root, "registry");

  const runGit = (cwd: string, ...args: string[]) => {
    const result = spawnSync("git", args, { cwd, encoding: "utf8" });
    assert.equal(result.status, 0, `git ${args.join(" ")} failed: ${result.stderr}`);
    return result.stdout.trim();
  };

  mkdirSync(remote);
  runGit(remote, "init", "-q", "-b", "main");
  runGit(remote, "config", "user.name", "Test");
  runGit(remote, "config", "user.email", "test@example.com");
  writeFileSync(join(remote, "paseo-plugin.json"), '{"id":"fixture","name":"Fixture","description":"Test plugin"}');
  writeFileSync(join(remote, "OVERVIEW.md"), "A fixture plugin overview.");
  writeFileSync(join(remote, "index.js"), 'throw new Error("Plugin code must never execute");');
  runGit(remote, "add", ".");
  runGit(remote, "commit", "-qm", "initial");
  const commit = runGit(remote, "rev-parse", "HEAD");

  mkdirSync(join(registry, "plugins/acme"), { recursive: true });
  cpSync(fileURLToPath(new URL("..", import.meta.url)), join(registry, "scripts"), { recursive: true });
  cpSync(fileURLToPath(new URL("../../categories.json", import.meta.url)), join(registry, "categories.json"));
  writeFileSync(join(registry, "featured.json"), "[]\n");
  writeFileSync(join(registry, "README.md"), "# Registry\n");
  writeFileSync(join(registry, ".gitignore"), "*.ignored.md\n");

  const existing = makeRecord("acme/existing", commit);
  // Keep an unchanged record with an unreachable pin on main to prove --changed skips untouched records.
  const unrelated = makeRecord("acme/unrelated", "0".repeat(40));
  writeFileSync(join(registry, "plugins/acme/existing.json"), serializeRecord(existing));
  writeFileSync(join(registry, "plugins/acme/unrelated.json"), serializeRecord(unrelated));

  runGit(registry, "init", "-q", "-b", "main");
  runGit(registry, "config", "user.name", "Test");
  runGit(registry, "config", "user.email", "test@example.com");
  runGit(registry, "add", ".");
  runGit(registry, "commit", "-qm", "base");
  runGit(registry, "update-ref", "refs/remotes/origin/main", "HEAD");

  const env = {
    ...process.env,
    GIT_CONFIG_COUNT: "3",
    GIT_CONFIG_KEY_0: `url.file://${remote}.insteadOf`,
    GIT_CONFIG_VALUE_0: "https://github.com/acme/existing.git",
    GIT_CONFIG_KEY_1: `url.file://${remote}.insteadOf`,
    GIT_CONFIG_VALUE_1: "https://github.com/newowner/fresh.git",
    GIT_CONFIG_KEY_2: `url.file://${remote}.insteadOf`,
    GIT_CONFIG_VALUE_2: "https://github.com/acme/unrelated.git",
  };

  const validateChanged = (...args: string[]) =>
    spawnSync(process.execPath, ["scripts/validate.ts", "--online", "--changed", ...args], {
      cwd: registry,
      env,
      encoding: "utf8",
    });

  return {
    registry,
    commit,
    existing,
    git: (...args: string[]) => runGit(registry, ...args),
    validateChanged,
  };
}

test("--changed validates unstaged edits and rejects broken unstaged records", (t) => {
  const f = createFixture(t);
  const path = join(f.registry, "plugins/acme/existing.json");

  writeFileSync(path, serializeRecord({ ...f.existing, listing: { name: "Edited Name" } }));
  const valid = f.validateChanged();
  assert.equal(valid.status, 0, valid.stderr);
  assert.match(valid.stdout, /1 record\(s\) match their pinned artifacts, 0 skipped/);

  writeFileSync(path, serializeRecord(makeRecord("acme/existing", "0".repeat(40))));
  const broken = f.validateChanged();
  assert.notEqual(broken.status, 0, "broken unstaged record must fail validation");
  assert.match(broken.stderr, /acme\/existing/);
});

test("--changed validates staged edits and rejects broken staged records", (t) => {
  const f = createFixture(t);
  const path = join(f.registry, "plugins/acme/existing.json");

  writeFileSync(path, serializeRecord({ ...f.existing, listing: { name: "Staged Name" } }));
  f.git("add", "plugins/acme/existing.json");
  const valid = f.validateChanged();
  assert.equal(valid.status, 0, valid.stderr);
  assert.match(valid.stdout, /1 record\(s\) match their pinned artifacts, 0 skipped/);

  writeFileSync(path, serializeRecord(makeRecord("acme/existing", "0".repeat(40))));
  f.git("add", "plugins/acme/existing.json");
  const broken = f.validateChanged();
  assert.notEqual(broken.status, 0, "broken staged record must fail validation");
  assert.match(broken.stderr, /acme\/existing/);
});

test("--changed validates untracked new plugin records and ignores gitignored files", (t) => {
  const f = createFixture(t);

  // Gitignored untracked file under plugins/ must not trigger selection.
  writeFileSync(join(f.registry, "plugins/acme/existing.ignored.md"), "ignored draft");
  const ignored = f.validateChanged();
  assert.equal(ignored.status, 0, ignored.stderr);
  assert.match(ignored.stdout, /0 record\(s\) match their pinned artifacts, 0 skipped/);

  const dir = join(f.registry, "plugins/newowner");
  const path = join(dir, "fresh.json");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path, serializeRecord(makeRecord("newowner/fresh", f.commit)));
  const valid = f.validateChanged();
  assert.equal(valid.status, 0, valid.stderr);
  assert.match(valid.stdout, /1 record\(s\) match their pinned artifacts, 0 skipped/);

  writeFileSync(path, serializeRecord(makeRecord("newowner/fresh", "0".repeat(40))));
  const broken = f.validateChanged();
  assert.notEqual(broken.status, 0, "broken untracked record must fail validation");
  assert.match(broken.stderr, /newowner\/fresh/);
});

test("--changed validates committed edits and deduplicates across commit, index, and working tree", (t) => {
  const f = createFixture(t);
  const recordPath = join(f.registry, "plugins/acme/existing.json");
  const overviewPath = join(f.registry, "plugins/acme/existing.md");

  writeFileSync(recordPath, serializeRecord({ ...f.existing, listing: { name: "Committed Name" } }));
  f.git("add", "plugins/acme/existing.json");
  f.git("commit", "-qm", "update existing");

  // Also stage an overview edit and leave an unstaged record edit for the same plugin.
  writeFileSync(overviewPath, "Staged overview.\n");
  f.git("add", "plugins/acme/existing.md");
  writeFileSync(recordPath, serializeRecord({ ...f.existing, listing: { name: "Unstaged Name" } }));

  const result = f.validateChanged();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1 record\(s\) match their pinned artifacts, 0 skipped/);
});

test("--changed exits 0 with 0 records when only non-registry files change", (t) => {
  const f = createFixture(t);

  writeFileSync(join(f.registry, "README.md"), "# Updated README\n");
  f.git("add", "README.md");
  f.git("commit", "-qm", "docs update");
  writeFileSync(join(f.registry, "README.md"), "# Staged README\n");
  f.git("add", "README.md");
  writeFileSync(join(f.registry, "README.md"), "# Unstaged README\n");
  writeFileSync(join(f.registry, "notes.txt"), "untracked note\n");

  const result = f.validateChanged();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /0 record\(s\) match their pinned artifacts, 0 skipped/);
});
