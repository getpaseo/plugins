import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { commitBumpForReview } from "./bump-review.ts";
import type { NpmClient } from "./npm.ts";
import { type PluginRecord, serializeRecord } from "./record.ts";
import { run } from "./shell.ts";

for (const scenario of ["present", "absent", "invalid", "network"] as const) {
  test(`bump review: ${scenario} author overview`, async () => {
    const directory = mkdtempSync(join(tmpdir(), "registry-bump-review-"));
    const repository = join(directory, "repository");
    const registry = join(directory, "registry");
    const remote = "https://github.com/acme/bump.git";
    const keys = ["GIT_CONFIG_COUNT", "GIT_CONFIG_KEY_0", "GIT_CONFIG_VALUE_0"];
    const previousEnv = keys.map((key) => process.env[key]);
    try {
      run("git", ["init", "-q", repository]);
      writeFileSync(join(repository, "paseo-plugin.json"), '{"id":"example"}');
      const pin = (tag: string) => {
        run("git", ["add", "."], { cwd: repository });
        run("git", ["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", tag], { cwd: repository });
        run("git", ["tag", tag], { cwd: repository });
        return run("git", ["rev-parse", "HEAD"], { cwd: repository });
      };
      const oldCommit = pin("v1");
      if (scenario === "present") writeFileSync(join(repository, "OVERVIEW.md"), "Author overview.");
      else if (scenario === "invalid") writeFileSync(join(repository, "OVERVIEW.md"), "npm install example");
      else writeFileSync(join(repository, "README.md"), "A README cannot satisfy the bump.");
      const nextCommit = pin("v2");
      process.env.GIT_CONFIG_COUNT = "1";
      process.env.GIT_CONFIG_KEY_0 = `url.file://${repository}.insteadOf`;
      process.env.GIT_CONFIG_VALUE_0 = remote;
      cpSync(fileURLToPath(new URL("..", import.meta.url)), join(registry, "scripts"), { recursive: true });
      cpSync(fileURLToPath(new URL("../../categories.json", import.meta.url)), join(registry, "categories.json"));
      writeFileSync(join(registry, "featured.json"), "[]\n");
      mkdirSync(join(registry, "plugins/acme"), { recursive: true });
      const recordPath = join(registry, "plugins/acme/example.json");
      const overviewPath = join(registry, "plugins/acme/example.md");
      const previous: PluginRecord = {
        id: "acme/example", categories: ["utils"], submittedAt: "2026-10-06", reviewedAt: "2026-10-06",
        repository: { url: "https://github.com/acme/bump", commit: oldCommit },
        artifact: { kind: "git", remote, tag: "v1", commit: oldCommit },
      };
      const next: PluginRecord = {
        ...previous, repository: { ...previous.repository, commit: nextCommit },
        artifact: { kind: "git", remote, tag: "v2", commit: nextCommit },
      };
      const options = { cwd: registry };
      writeFileSync(recordPath, serializeRecord(previous));
      writeFileSync(overviewPath, "Imported stopgap.");
      run("git", ["init", "-q"], options);
      run("git", ["config", "user.name", "Test"], options);
      run("git", ["config", "user.email", "test@example.com"], options);
      run("git", ["add", "plugins"], options);
      run("git", ["commit", "-qm", "import"], options);
      run("git", ["update-ref", "refs/remotes/origin/main", "HEAD"], options);
      const base = run("git", ["rev-parse", "HEAD"], options);
      const client: NpmClient = {
        async packument() { throw new Error("Source lookup unavailable"); },
        async file() { throw new Error("Not needed for Git overview resolution"); },
        async provenance() { return null; },
        async tarball() { throw new Error("Plugin artifacts must not execute"); },
      };
      if (scenario === "network") {
        next.artifact = { kind: "npm", package: "@acme/example", version: "2.0.0", resolved: "https://registry.npmjs.org/example.tgz", integrity: "sha512-YWJj" };
      }
      const review = () => commitBumpForReview({
        client, next, version: "v2", registryRoot: registry,
        validate: async () => {
          run(process.execPath, ["scripts/validate.ts", "--online", "--changed"], options);
          return "Inline validation passed.";
        },
      });
      if (scenario === "invalid" || scenario === "network") {
        await assert.rejects(review(), scenario === "invalid" ? /install commands/ : /Source lookup unavailable/);
        assert.equal(run("git", ["rev-parse", "HEAD"], options), base);
        assert.equal(readFileSync(recordPath, "utf8"), serializeRecord(previous));
        assert.equal(readFileSync(overviewPath, "utf8"), "Imported stopgap.");
        assert.equal(run("git", ["diff", "--cached", "--name-only"], options), "");
        return;
      }
      const result = await review();
      const commit = run("git", ["rev-parse", "HEAD"], options);
      assert.notEqual(commit, base);
      assert.deepEqual(JSON.parse(run("git", ["show", `${commit}:plugins/acme/example.json`], options)), next);
      if (scenario === "present") {
        assert.equal(existsSync(overviewPath), false);
        assert.match(run("git", ["diff", "--name-status", base, commit], options), /D\s+plugins\/acme\/example.md/);
        assert.match(result.note, /copy is removed in this bump/);
        assert.equal(result.validation, "Inline validation passed.");
      } else {
        assert.equal(readFileSync(overviewPath, "utf8"), "Imported stopgap.");
        assert.equal(run("git", ["show", `${commit}:plugins/acme/example.md`], options), "Imported stopgap.");
        assert.match(result.note, /bump cannot merge/);
        assert.equal(result.validation, "Inline validation failed. See the Bump workflow log.");
      }
    } finally {
      keys.forEach((key, index) => {
        if (previousEnv[index] === undefined) delete process.env[key];
        else process.env[key] = previousEnv[index];
      });
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
