import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { test, type TestContext } from "node:test";

function fixture(t: TestContext, path = "") {
  const root = mkdtempSync(join(tmpdir(), "registry-git-pins-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const remote = join(root, "remote");
  const registry = join(root, "registry");
  const git = (...args: string[]) => {
    const result = spawnSync("git", args, { cwd: remote, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  mkdirSync(remote);
  git("init", "-q");
  git("config", "user.name", "Test");
  git("config", "user.email", "test@example.com");
  const plugin = join(remote, path);
  mkdirSync(plugin, { recursive: true });
  writeFileSync(join(plugin, "paseo-plugin.json"), '{"id":"example","name":"Example","description":"Fixture"}');
  writeFileSync(join(plugin, "OVERVIEW.md"), "A fixture plugin.");
  // If artifact code is ever executed, the test leaves an observable failure.
  writeFileSync(join(plugin, "index.js"), 'throw new Error("Plugin code must never execute");');
  git("add", ".");
  git("commit", "-qm", "initial");
  const commit = git("rev-parse", "HEAD");
  cpSync(fileURLToPath(new URL(".", import.meta.url)), join(registry, "scripts"), { recursive: true });
  cpSync(fileURLToPath(new URL("../categories.json", import.meta.url)), join(registry, "categories.json"));
  mkdirSync(join(registry, "plugins"));
  const env = {
    ...process.env,
    INSTALLS_URL: "data:application/json,{}",
    GIT_CONFIG_COUNT: "1",
    GIT_CONFIG_KEY_0: `url.file://${remote}.insteadOf`,
    GIT_CONFIG_VALUE_0: "https://github.com/acme/fixture.git",
  };
  const cli = (script: string, ...args: string[]) => spawnSync(process.execPath, [`scripts/${script}.ts`, ...args], {
    cwd: registry, env, encoding: "utf8",
  });
  const add = (...args: string[]) => cli("add", "https://github.com/acme/fixture", "--categories", "utils", "--submitted-by", "acme", ...(path ? ["--plugin-path", path] : []), ...args);
  const recordPath = join(registry, "plugins/acme", `${path ? path.split("/").at(-1) : "fixture"}.json`);
  const record = () => JSON.parse(readFileSync(recordPath, "utf8"));
  return { remote, registry, git, commit, plugin, cli, add, recordPath, record };
}

for (const path of ["", "plugins/example"]) {
  test(`add explicit commit pin${path ? " in monorepo" : ""}`, (t) => {
    const f = fixture(t, path);
    const result = f.add("--commit", f.commit);
    assert.equal(result.status, 0, result.stderr);
    const record = f.record();
    assert.equal(record.artifact.commit, f.commit);
    assert.equal("tag" in record.artifact, false);
    assert.equal(record.artifact.pluginPath, path || undefined);
    assert.equal(record.repository.commit, f.commit);
    assert.equal(record.id, `acme/${path ? "example" : "fixture"}`);
    assert.equal(record.submittedBy, "acme");
    assert.deepEqual(record.categories, ["utils"]);
    const build = f.cli("build");
    assert.equal(build.status, 0, build.stderr);
    const detail = JSON.parse(readFileSync(join(f.registry, "dist/plugins", `${record.id}.json`), "utf8"));
    assert.deepEqual(detail.artifact, record.artifact);
    assert.equal(detail.readme, "A fixture plugin.");
  });
}

test("add rejects malformed, missing and unreachable commits", (t) => {
  const f = fixture(t);
  const branch = f.git("branch", "--show-current");
  f.git("tag", "v1.0.0");
  f.git("checkout", "--orphan", "unreachable");
  f.git("commit", "-qm", "orphan");
  const orphan = f.git("rev-parse", "HEAD");
  f.git("checkout", branch);
  f.git("branch", "-D", "unreachable");
  for (const commit of ["HEAD", f.commit.slice(0, 12), "0".repeat(40), orphan]) {
    const result = f.add("--commit", commit);
    assert.notEqual(result.status, 0, commit);
    assert.equal(existsSync(f.recordPath), false);
  }
});

test("commit-only bump skips no tags and proposes first tag on same commit", (t) => {
  const f = fixture(t);
  assert.equal(f.add("--commit", f.commit).status, 0);
  const before = readFileSync(f.recordPath, "utf8");
  const skip = f.cli("bump", "--dry-run");
  assert.equal(skip.status, 0, skip.stderr);
  assert.doesNotMatch(skip.stdout, /Git tag/);
  f.git("tag", "-a", "v1.0.0", "-m", "first release");
  const bump = f.cli("bump", "--dry-run");
  assert.equal(bump.status, 0, bump.stderr);
  assert.match(bump.stdout, /Git tag `v1.0.0`/);
  assert.equal(readFileSync(f.recordPath, "utf8"), before);
});

test("tagged submissions and version bumps retain their pins", (t) => {
  const f = fixture(t);
  f.git("tag", "v1.0.0");
  const added = f.add();
  assert.equal(added.status, 0, added.stderr);
  assert.equal(f.record().artifact.tag, "v1.0.0");
  writeFileSync(join(f.plugin, "OVERVIEW.md"), "Updated fixture.");
  f.git("add", ".");
  f.git("commit", "-qm", "update");
  f.git("tag", "v2.0.0");
  const bump = f.cli("bump", "--dry-run");
  assert.equal(bump.status, 0, bump.stderr);
  assert.match(bump.stdout, /Git tag `v2.0.0`/);
});

test("bump propagates remote failures and invalid tags", (t) => {
  const f = fixture(t);
  assert.equal(f.add("--commit", f.commit).status, 0);
  f.git("tag", "blob-tag", f.git("hash-object", "paseo-plugin.json"));
  const invalid = f.cli("bump", "--dry-run");
  assert.notEqual(invalid.status, 0);
  rmSync(f.remote, { recursive: true });
  const unavailable = f.cli("bump", "--dry-run");
  assert.notEqual(unavailable.status, 0);
  assert.match(unavailable.stderr, /repository|git/i);
});

test("commit pins require a manifest at the declared plugin path", (t) => {
  const f = fixture(t, "plugins/example");
  const wrongPath = f.cli("add", "https://github.com/acme/fixture", "--categories", "utils", "--commit", f.commit, "--plugin-path", "plugins/missing");
  assert.notEqual(wrongPath.status, 0);
  assert.equal(existsSync(f.recordPath), false);
  rmSync(join(f.plugin, "paseo-plugin.json"));
  f.git("add", ".");
  f.git("commit", "-qm", "missing manifest");
  assert.notEqual(f.add("--commit", f.git("rev-parse", "HEAD")).status, 0);
  assert.equal(existsSync(f.recordPath), false);
});

test("commit-only validation preserves author overview and import rules", (t) => {
  const f = fixture(t);
  const registryGit = (...args: string[]) => {
    const result = spawnSync("git", args, { cwd: f.registry, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  registryGit("init", "-q");
  registryGit("config", "user.name", "Test");
  registryGit("config", "user.email", "test@example.com");
  registryGit("add", "categories.json");
  registryGit("commit", "-qm", "base");
  registryGit("update-ref", "refs/remotes/origin/main", "HEAD");
  assert.equal(f.add("--commit", f.commit).status, 0);
  registryGit("add", "plugins");
  registryGit("commit", "-qm", "author submission");
  const author = f.cli("validate", "--online", "--changed");
  assert.equal(author.status, 0, author.stderr);

  rmSync(join(f.plugin, "OVERVIEW.md"));
  f.git("add", ".");
  f.git("commit", "-qm", "no author overview");
  const imported = f.record();
  imported.artifact.commit = f.git("rev-parse", "HEAD");
  imported.repository.commit = imported.artifact.commit;
  writeFileSync(f.recordPath, JSON.stringify(imported));
  writeFileSync(f.recordPath.replace(/\.json$/, ".md"), "Imported overview.\n\n*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/fixture).*\n");
  registryGit("add", "plugins");
  registryGit("commit", "-qm", "approved import");
  const missing = f.cli("validate", "--online", "--changed");
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /OVERVIEW.md is required/);
  const allowed = f.cli("validate", "--online", "--changed", "--allow-imports");
  assert.equal(allowed.status, 0, allowed.stderr);
  registryGit("update-ref", "refs/remotes/origin/main", "HEAD");
  imported.categories = ["themes"];
  writeFileSync(f.recordPath, JSON.stringify(imported));
  registryGit("add", "plugins");
  registryGit("commit", "-qm", "metadata only");
  const unchanged = f.cli("validate", "--online", "--changed");
  assert.equal(unchanged.status, 0, unchanged.stderr);
  writeFileSync(join(f.plugin, "README.md"), "Changed source.");
  f.git("add", ".");
  f.git("commit", "-qm", "changed pin");
  imported.artifact.commit = f.git("rev-parse", "HEAD");
  imported.repository.commit = imported.artifact.commit;
  writeFileSync(f.recordPath, JSON.stringify(imported));
  registryGit("add", "plugins");
  registryGit("commit", "-qm", "pin update");
  const changed = f.cli("validate", "--online", "--changed", "--allow-imports");
  assert.notEqual(changed.status, 0);
  assert.match(changed.stderr, /OVERVIEW.md is required/);
});
