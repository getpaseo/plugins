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
  return { remote, registry, env, git, commit, plugin, cli, add, recordPath, record };
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
  old.artifact.remote = "https://github.com/acme/old.git";
  old.repository.url = "https://github.com/acme/old";
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

test("build publishes the other plugins when one pinned source cannot be fetched", (t) => {
  const f = fixture(t);
  assert.equal(f.add("--commit", f.commit).status, 0);
  const missing = { ...f.record(), id: "acme/missing" };
  missing.artifact.remote = "https://github.com/acme/missing.git";
  missing.repository.url = "https://github.com/acme/missing";
  writeFileSync(join(f.registry, "plugins/acme/missing.json"), JSON.stringify(missing));
  const env = {
    ...f.env,
    GITHUB_OUTPUT: join(f.registry, "build-output"),
    GIT_CONFIG_COUNT: "2",
    GIT_CONFIG_KEY_1: `url.file://${join(f.remote, "..", "missing")}.insteadOf`,
    GIT_CONFIG_VALUE_1: "https://github.com/acme/missing.git",
  };
  const build = spawnSync(process.execPath, ["scripts/build.ts"], { cwd: f.registry, env, encoding: "utf8" });
  assert.equal(build.status, 0, build.stderr);
  assert.equal(readFileSync(env.GITHUB_OUTPUT, "utf8"), "publish=true\n");
  assert.match(build.stderr, /Skipped acme\/missing: .*acme\/missing\.git/);
  assert.match(build.stdout, /1 plugin\(s\), 1 skipped/);
  assert.equal(existsSync(join(f.registry, "dist/plugins/acme/missing.json")), false);
  const detail = JSON.parse(readFileSync(join(f.registry, "dist/plugins/acme/fixture.json"), "utf8"));
  assert.equal(detail.readme, "A fixture plugin.");
  const index = JSON.parse(readFileSync(join(f.registry, "dist/index.json"), "utf8"));
  assert.deepEqual(index.plugins.map((plugin: { id: string }) => plugin.id), ["acme/fixture"]);

  // Even when the last plugin fails, report the skip and produce a valid index.
  rmSync(f.recordPath);
  const empty = spawnSync(process.execPath, ["scripts/build.ts"], { cwd: f.registry, env, encoding: "utf8" });
  assert.equal(empty.status, 0, empty.stderr);
  assert.equal(readFileSync(env.GITHUB_OUTPUT, "utf8"), "publish=true\npublish=false\n");
  assert.match(empty.stderr, /Skipped acme\/missing/);
  assert.deepEqual(JSON.parse(readFileSync(join(f.registry, "dist/index.json"), "utf8")).plugins, []);
});

test("localized Git build preserves v1 defaults and selects changes to reviewer translations", (t) => {
  const f = fixture(t, "plugins/example");
  writeFileSync(join(f.plugin, "paseo-plugin.json"), JSON.stringify({
    name: "Example", description: "English description",
    translations: { "zh-CN": { name: "示例", description: "中文描述" } },
  }));
  writeFileSync(join(f.plugin, "OVERVIEW.zh-CN.md"), "作者概述");
  f.git("add", "."); f.git("commit", "-qm", "translations");
  const reviewed = f.git("rev-parse", "HEAD");
  writeFileSync(join(f.plugin, "OVERVIEW.zh-CN.md"), "Unreviewed HEAD translation");
  f.git("add", "."); f.git("commit", "-qm", "unreviewed");
  assert.equal(f.add("--commit", reviewed).status, 0);
  const record = f.record();
  record.listing = { translations: { "zh-CN": { name: "审阅名称" } } };
  writeFileSync(f.recordPath, JSON.stringify(record));
  writeFileSync(f.recordPath.replace(/\.json$/, ".zh-CN.md"), "Registry Chinese fallback");
  writeFileSync(f.recordPath.replace(/\.json$/, ".fr.md"), "Présentation du réviseur");
  const build = f.cli("build");
  assert.equal(build.status, 0, build.stderr);
  const index = JSON.parse(readFileSync(join(f.registry, "dist/index.json"), "utf8"));
  const detail = JSON.parse(readFileSync(join(f.registry, "dist/plugins/acme/example.json"), "utf8"));
  assert.equal(index.schemaVersion, 1);
  assert.equal(detail.name, "Example"); assert.equal(detail.description, "English description");
  assert.equal(detail.readme, "A fixture plugin.");
  assert.deepEqual(detail.translations, { "zh-CN": { name: "审阅名称", description: "中文描述" } });
  assert.deepEqual(detail.overviewTranslations, { "zh-CN": "作者概述", fr: "Présentation du réviseur" });
  const { readme, overviewTranslations, ...summary } = detail;
  assert.deepEqual(index.plugins, [summary]);
  // Old consumers still use the same string fields and installation pin.
  assert.equal(typeof summary.name, "string"); assert.equal(typeof summary.description, "string");
  assert.equal(detail.artifact.commit, reviewed);
  const git = (...args: string[]) => {
    const r = spawnSync("git", args, { cwd: f.registry, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
  };
  git("init", "-q"); git("config", "user.name", "Test"); git("config", "user.email", "test@example.com");
  git("add", "plugins"); git("commit", "-qm", "reviewed");
  git("update-ref", "refs/remotes/origin/main", "HEAD");
  writeFileSync(f.recordPath.replace(/\.json$/, ".fr.md"), "Présentation mise à jour");
  git("add", "plugins"); git("commit", "-qm", "reviewer translation");
  const checked = f.cli("validate", "--online", "--changed");
  assert.equal(checked.status, 0, checked.stderr);
  assert.match(checked.stdout, /1 record\(s\) match/);
  writeFileSync(f.recordPath.replace(/\.json$/, ".zh-cn.md"), "Invalid locale");
  const auxiliary = f.cli("validate");
  assert.equal(auxiliary.status, 0, auxiliary.stderr);
});


test("registry-wide validation skips broken pins and media while changed-record review rejects them", (t) => {
  const f = fixture(t);
  assert.equal(f.add("--commit", f.commit).status, 0);
  const missing = structuredClone(f.record());
  missing.id = "acme/missing";
  missing.artifact.commit = "0".repeat(40);
  missing.repository.url = "https://github.com/acme/missing";
  const media = structuredClone(f.record());
  media.id = "acme/media";
  media.repository.url = "https://github.com/acme/media";
  media.listing = { media: ["https://unreachable.invalid/image.png"] };
  missing.artifact.remote = "https://github.com/acme/missing.git";
  media.artifact.remote = "https://github.com/acme/media.git";
  Object.assign(f.env, {
    GIT_CONFIG_COUNT: "3",
    GIT_CONFIG_KEY_1: `url.file://${f.remote}.insteadOf`,
    GIT_CONFIG_VALUE_1: missing.artifact.remote,
    GIT_CONFIG_KEY_2: `url.file://${f.remote}.insteadOf`,
    GIT_CONFIG_VALUE_2: media.artifact.remote,
  });
  const git = (...args: string[]) => {
    const r = spawnSync("git", args, { cwd: f.registry, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
  };
  git("init", "-q");
  git("config", "user.name", "Test");
  git("config", "user.email", "test@example.com");
  git("add", ".");
  git("commit", "-qm", "healthy registry");
  git("update-ref", "refs/remotes/origin/main", "HEAD");
  writeFileSync(join(f.registry, "plugins/acme/missing.json"), JSON.stringify(missing));
  writeFileSync(join(f.registry, "plugins/acme/media.json"), JSON.stringify(media));
  git("add", "plugins");
  git("commit", "-qm", "broken listings");

  const full = f.cli("validate", "--online");
  assert.equal(full.status, 0, full.stderr);
  assert.match(full.stderr, /Skipped acme\/missing: .*0000000000000000000000000000000000000000/);
  assert.match(full.stderr, /Skipped acme\/media: .*media/);
  assert.match(full.stdout, /1 record\(s\) match their pinned artifacts, 2 skipped/);

  const review = f.cli("validate", "--online", "--changed");
  assert.notEqual(review.status, 0);
  assert.match(review.stderr, /acme\/media/);
  assert.match(review.stderr, /acme\/missing/);
});


for (const failure of ["malformed record", "invalid record", "mismatched id", "unreadable overview", "unreadable translation", "duplicate source", "pending submission"]) {
  test(`registry-wide validation and publication skip a plugin with ${failure}`, (t) => {
    const f = fixture(t);
    assert.equal(f.add("--commit", f.commit).status, 0);
    const broken = structuredClone(f.record());
    broken.id = "acme/broken";
    broken.repository.url = "https://github.com/acme/broken";
    broken.artifact.remote = "https://github.com/acme/broken.git";
    Object.assign(f.env, {
      GIT_CONFIG_COUNT: "2",
      GIT_CONFIG_KEY_1: `url.file://${f.remote}.insteadOf`,
      GIT_CONFIG_VALUE_1: broken.artifact.remote,
    });
    const path = join(f.registry, "plugins/acme/broken.json");
    if (failure === "mismatched id") broken.id = "acme/wrong";
    if (failure === "invalid record") broken.categories = ["unknown-category"];
    if (failure === "duplicate source") {
      writeFileSync(join(f.registry, "plugins/acme/duplicate.json"), JSON.stringify({ ...broken, id: "acme/duplicate" }));
    }
    if (failure === "pending submission") {
      mkdirSync(join(f.registry, "submissions"));
      writeFileSync(join(f.registry, "submissions/123.json"), "{}");
      broken.artifact.commit = "0".repeat(40);
    }
    writeFileSync(path, failure === "malformed record" ? "{" : JSON.stringify(broken));
    if (failure === "unreadable overview") mkdirSync(path.replace(/\.json$/, ".md"));
    if (failure === "unreadable translation") mkdirSync(path.replace(/\.json$/, ".fr.md"));
    const skipped = failure === "duplicate source" ? 2 : 1;
    const strict = f.cli("validate");
    assert.notEqual(strict.status, 0, "strict local checks must still reject incomplete or invalid records");
    // Featuring a failed plugin must not turn its isolation into a registry failure.
    writeFileSync(join(f.registry, "featured.json"), JSON.stringify(["acme/broken", "acme/fixture"]));
    const validate = f.cli("validate", "--online");
    assert.equal(validate.status, 0, validate.stderr);
    assert.match(validate.stderr, /Skipped acme\/broken:/);
    assert.ok(validate.stdout.includes(`1 record(s) match their pinned artifacts, ${skipped} skipped`), validate.stdout);
    const build = f.cli("build");
    assert.equal(build.status, 0, build.stderr);
    assert.match(build.stderr, /Skipped acme\/broken:/);
    assert.ok(build.stdout.includes(`1 plugin(s), ${skipped} skipped`), build.stdout);
    const index = JSON.parse(readFileSync(join(f.registry, "dist/index.json"), "utf8"));
    assert.deepEqual(index.plugins.map((plugin: { id: string }) => plugin.id), ["acme/fixture"]);
    assert.deepEqual(index.featured, ["acme/fixture"]);
  });
}
