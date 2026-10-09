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
  git("init", "-q", "-b", "main");
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
  writeFileSync(join(registry, "featured.json"), "[]\n");
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

test("reviewer resolves main without tags and honors a supplied Git ref", (t) => {
  const f = fixture(t);
  f.git("tag", "v1.0.0");
  f.git("commit", "--allow-empty", "-qm", "main advances");
  const head = f.git("rev-parse", "HEAD");
  const result = f.add();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(f.record().artifact.commit, head);
  assert.equal(f.record().artifact.tag, undefined);
  rmSync(f.recordPath);
  const tagged = f.cli("add", "github:acme/fixture#v1.0.0", "--categories", "utils");
  assert.equal(tagged.status, 0, tagged.stderr);
  assert.equal(f.record().artifact.commit, f.commit);
  rmSync(f.recordPath);
  f.git("tag", "-d", "v1.0.0");
  assert.equal(f.add().status, 0);
  assert.equal(f.record().artifact.commit, head);
});

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


test("automatic bumps never inspect Git sources, including tagged or unavailable repositories", (t) => {
  const f = fixture(t);
  assert.equal(f.add("--commit", f.commit).status, 0);
  f.git("tag", "v2.0.0");
  const record = f.record();
  record.artifact.tag = "v2.0.0";
  writeFileSync(f.recordPath, JSON.stringify(record));
  const before = readFileSync(f.recordPath, "utf8");
  rmSync(f.remote, { recursive: true });
  const bump = f.cli("bump", "--dry-run");
  assert.equal(bump.status, 0, bump.stderr);
  assert.match(bump.stdout, /0 bump PR/);
  assert.equal(readFileSync(f.recordPath, "utf8"), before);
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

test("commit-only validation accepts registry overviews for submissions and bumps", (t) => {
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
  const fallback = f.cli("validate", "--online", "--changed");
  assert.equal(fallback.status, 0, fallback.stderr);
  registryGit("update-ref", "refs/remotes/origin/main", "HEAD");
  imported.categories = ["workspaces"];
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
  const changed = f.cli("validate", "--online", "--changed");
  assert.equal(changed.status, 0, changed.stderr);
});


test("changed-record review ignores unreachable media on an unchanged listing", (t) => {
  const f = fixture(t);
  assert.equal(f.add("--commit", f.commit).status, 0);
  const old = f.record();
  old.id = "acme/old";
  old.listing = { media: ["https://unrelated-plugin.invalid/image.png"] };
  rmSync(f.recordPath);
  writeFileSync(join(f.registry, "plugins/acme/old.json"), JSON.stringify(old));
  const git = (...args: string[]) => {
    const r = spawnSync("git", args, { cwd: f.registry, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
  };
  git("init", "-q");
  git("config", "user.name", "Test");
  git("config", "user.email", "test@example.com");
  git("add", "plugins", "categories.json", "featured.json");
  git("commit", "-qm", "existing registry");
  git("update-ref", "refs/remotes/origin/main", "HEAD");
  assert.equal(f.add("--commit", f.commit).status, 0);
  git("add", "plugins");
  git("commit", "-qm", "submitted plugin");
  const result = f.cli("validate", "--online", "--changed");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /1 record.*match/);
});
