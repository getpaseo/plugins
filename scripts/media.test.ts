import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

// Exercise the validator and publisher against real pinned Git trees, without plugin execution.
test("new listings and bumps require media files inside the pinned plugin, including approved imports", (t) => {
  const root = mkdtempSync(join(tmpdir(), "registry-media-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const remote = join(root, "remote");
  const registry = join(root, "registry");
  const pluginPath = "packages/example";
  mkdirSync(join(remote, pluginPath), { recursive: true });
  mkdirSync(join(registry, "plugins/acme"), { recursive: true });
  const command = (cwd: string, executable: string, args: string[], env = process.env) =>
    spawnSync(executable, args, { cwd, encoding: "utf8", env });
  const git = (cwd: string, ...args: string[]) => {
    const result = command(cwd, "git", args);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  for (const directory of [remote, registry]) {
    git(directory, "init", "-q");
    git(directory, "config", "user.name", "Test");
    git(directory, "config", "user.email", "test@example.com");
  }
  writeFileSync(join(remote, pluginPath, "paseo-plugin.json"), '{"id":"example"}');
  writeFileSync(join(remote, pluginPath, "OVERVIEW.md"), "Fixture overview.");
  writeFileSync(join(remote, pluginPath, "index.js"), 'throw new Error("Never execute plugin code");');
  writeFileSync(join(remote, "outside.png"), "outside");
  symlinkSync("../../outside.png", join(remote, pluginPath, "escape.png"));
  writeFileSync(join(remote, pluginPath, "icon.png"), "pinned icon");
  writeFileSync(join(remote, pluginPath, "screen.png"), "pinned screen");
  const pin = (listing: unknown) => {
    writeFileSync(join(remote, pluginPath, "paseo-listing.json"), JSON.stringify(listing));
    git(remote, "add", ".");
    git(remote, "commit", "-qm", "fixture");
    return git(remote, "rev-parse", "HEAD");
  };
  const absolute = "https://github.com/acme/media/raw/" + "a".repeat(40) + "/icon.png";
  const absoluteCommit = pin({ icon: absolute, screenshots: ["https://external.test/screen.png"] });
  const relativeCommit = pin({ icon: "./icon.png", screenshots: ["screen.png"] });
  cpSync(fileURLToPath(new URL(".", import.meta.url)), join(registry, "scripts"), { recursive: true });
  cpSync(fileURLToPath(new URL("../categories.json", import.meta.url)), join(registry, "categories.json"));
  git(registry, "add", "categories.json");
  git(registry, "commit", "-qm", "base");
  const emptyBase = git(registry, "rev-parse", "HEAD");
  git(registry, "update-ref", "refs/remotes/origin/main", emptyBase);
  const env = {
    ...process.env, INSTALLS_URL: "data:application/json,{}",
    GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: `url.file://${remote}.insteadOf`,
    GIT_CONFIG_VALUE_0: "https://github.com/acme/media.git",
  };
  const recordPath = join(registry, "plugins/acme/example.json");
  const record = (commit: string, listing?: unknown) => ({
    id: "acme/example", artifact: { kind: "git", remote: "https://github.com/acme/media.git", commit, pluginPath },
    repository: { url: "https://github.com/acme/media", commit }, categories: ["utils"],
    submittedAt: "2026-10-06", submittedBy: "acme", reviewedAt: "2026-10-06", ...(listing ? { listing } : {}),
  });
  const save = (value: unknown) => {
    writeFileSync(recordPath, JSON.stringify(value));
    git(registry, "add", "plugins");
    git(registry, "commit", "--allow-empty", "-qm", "record");
  };
  const validate = (...args: string[]) => command(registry, process.execPath,
    ["scripts/validate.ts", "--online", "--changed", ...args], env);
  save(record(absoluteCommit));
  for (const flags of [[], ["--allow-imports"]]) {
    const result = validate(...flags);
    assert.notEqual(result.status, 0, "absolute artifact media must fail even on approved import");
    assert.match(result.stderr, /icon.*relative path|screenshots.*relative path/);
  }
  save(record(relativeCommit));
  assert.equal(validate().status, 0);
  const build = command(registry, process.execPath, ["scripts/build.ts"], env);
  assert.equal(build.status, 0, build.stderr);
  const detail = JSON.parse(readFileSync(join(registry, "dist/plugins/acme/example.json"), "utf8"));
  assert.equal(detail.icon, `https://github.com/acme/media/raw/${relativeCommit}/${pluginPath}/icon.png`);
  assert.deepEqual(detail.screenshots, [`https://github.com/acme/media/raw/${relativeCommit}/${pluginPath}/screen.png`]);
  // A file added to HEAD after review does not satisfy the pinned artifact.
  writeFileSync(join(remote, pluginPath, "future.png"), "unreviewed");
  git(remote, "add", ".");
  git(remote, "commit", "-qm", "future file");
  for (const path of ["missing.png", "future.png", "escape.png", "../outside.png", "/outside.png", "%2e%2e/outside.png", "https://external.test/icon.png"]) {
    save(record(relativeCommit, { icon: path, screenshots: [] }));
    const result = validate();
    assert.notEqual(result.status, 0, path);
  }
  save(record(relativeCommit, { icon: "icon.png", screenshots: ["missing.png"] }));
  assert.notEqual(validate().status, 0);
  // Metadata cleanup may retain legacy URLs only while its pin is unchanged.
  save(record(relativeCommit, { icon: absolute, screenshots: [] }));
  git(registry, "update-ref", "refs/remotes/origin/main", "HEAD");
  save({ ...record(relativeCommit, { icon: absolute, screenshots: [] }), categories: ["themes"] });
  assert.equal(validate().status, 0);
  save(record(absoluteCommit, { icon: absolute, screenshots: [] }));
  for (const flags of [[], ["--allow-imports"]]) assert.notEqual(validate(...flags).status, 0);
});
