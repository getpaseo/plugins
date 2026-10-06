import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { readAuthorOverview } from "./overview.ts";
import { serializeRecord } from "./record.ts";
import { resolvePlugin } from "./listing.ts";
import type { NpmClient, VersionDoc } from "./npm.ts";
import type { PluginRecord } from "./record.ts";
import { run } from "./shell.ts";
import { validateArtifact } from "./validate-artifact.ts";

for (const kind of ["npm", "git"] as const) {
  test(`${kind}: pinned repository overview is required except for unchanged or approved new imports`, async () => {
    const directory = mkdtempSync(join(tmpdir(), "registry-required-overview-"));
    const pluginPath = "packages/example";
    const plugin = join(directory, pluginPath);
    const remote = "https://github.com/acme/overview";
    const keys = ["GIT_CONFIG_COUNT", "GIT_CONFIG_KEY_0", "GIT_CONFIG_VALUE_0"];
    const previousEnv = keys.map((key) => process.env[key]);
    try {
      run("git", ["init", "-q", directory]);
      mkdirSync(plugin, { recursive: true });
      writeFileSync(join(plugin, "paseo-plugin.json"), '{"id":"example"}');
      writeFileSync(join(plugin, "OVERVIEW.md"), "Author overview");
      writeFileSync(join(plugin, "README.md"), "Wrong README");
      writeFileSync(join(plugin, "readme.md"), "Wrong lowercase README");
      writeFileSync(join(plugin, "paseo-listing.json"), '{"readme":"README.md"}');
      writeFileSync(join(directory, "OVERVIEW.md"), "npm install wrong-root");
      process.env.GIT_CONFIG_COUNT = "1";
      process.env.GIT_CONFIG_KEY_0 = `url.file://${directory}.insteadOf`;
      process.env.GIT_CONFIG_VALUE_0 = remote;
      const pin = (tag: string) => {
        run("git", ["add", "."], { cwd: directory });
        run("git", ["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", tag], { cwd: directory });
        run("git", ["tag", tag], { cwd: directory });
        return run("git", ["rev-parse", "HEAD"], { cwd: directory });
      };
      const commit = pin("v1");
      const doc: VersionDoc = {
        name: "@acme/example", version: "1.0.0",
        repository: { url: remote, directory: pluginPath },
        dist: { integrity: "sha512-YWJj", tarball: "https://registry.npmjs.org/example.tgz" },
      };
      let provenanceCommit = commit;
      const client: NpmClient = {
        async packument() {
          return { name: doc.name, "dist-tags": { latest: "9.0.0" }, time: { [doc.version]: "2026-10-06" }, versions: { [doc.version]: doc } };
        },
        async file(_name, version, path) {
          assert.equal(version, doc.version);
          // Published README/OVERVIEW content is deliberately different from the repository.
          return path === "paseo-plugin.json" ? '{"id":"example"}'
            : path === "paseo-listing.json" ? '{"readme":"README.md"}'
            : "Wrong tarball content";
        },
        async provenance() { return { repositoryUrl: remote.replace(/\.git$/, ""), commit: provenanceCommit }; },
        async tarball() { throw new Error("Plugin artifacts must not execute"); },
      };
      const record: PluginRecord = {
        id: "acme/example", categories: ["themes"], submittedAt: "2026-10-06", reviewedAt: "2026-10-06",
        repository: { url: "https://github.com/acme/overview/tree/HEAD/packages/example", commit },
        artifact: kind === "git" ? { kind, remote, commit, tag: "v1", pluginPath }
          : { kind, package: doc.name, version: doc.version, resolved: doc.dist.tarball, integrity: doc.dist.integrity },
      };
      assert.equal(await readAuthorOverview(client, record), "Author overview");
      assert.equal((await resolvePlugin(client, record, "Registry stopgap")).readme, "Author overview");
      assert.deepEqual(await validateArtifact(client, record), []);
      rmSync(join(plugin, "OVERVIEW.md"));
      const absentCommit = pin("v2");
      provenanceCommit = absentCommit;
      const absent: PluginRecord = {
        ...record, repository: { ...record.repository, commit: absentCommit },
        artifact: kind === "git" ? { ...record.artifact, kind, remote, commit: absentCommit, tag: "v2", pluginPath }
          : { kind, package: doc.name, version: doc.version, resolved: doc.dist.tarball, integrity: doc.dist.integrity },
      };
      // The old pin must still read its own overview after HEAD loses it.
      assert.equal(await readAuthorOverview(client, record), "Author overview");
      assert.equal((await resolvePlugin(client, record, "Registry stopgap")).readme, "Author overview");
      assert.equal((await resolvePlugin(client, absent, "Registry stopgap")).readme, "Registry stopgap");
      assert.equal(await readAuthorOverview(client, absent), null);
      await assert.rejects(resolvePlugin(client, absent), /OVERVIEW.md.*required/);
      await assert.rejects(validateArtifact(client, absent), /OVERVIEW.md.*required/);
      await assert.rejects(validateArtifact(client, absent, { registryOverview: "Registry stopgap" }), /OVERVIEW.md.*required/);
      assert.deepEqual(await validateArtifact(client, absent, { previous: absent, registryOverview: "Registry stopgap" }), []);
      assert.deepEqual(await validateArtifact(client, absent, { previous: { ...absent, listing: { name: "Old name" } }, registryOverview: "Registry stopgap" }), []);
      assert.deepEqual(await validateArtifact(client, absent, { registryOverview: "Registry stopgap", allowNewImport: true }), []);
      const changed = kind === "npm"
        ? { ...absent, artifact: { ...absent.artifact, integrity: "sha512-bmV3" } }
        : record;
      await assert.rejects(validateArtifact(client, absent, { previous: changed, registryOverview: "Registry stopgap", allowNewImport: true }), /OVERVIEW.md.*required/);
      await assert.rejects(validateArtifact(client, absent, { previous: absent }), /OVERVIEW.md.*required/);
      for (const [index, command] of ["paseo plugin add acme/example", "npm install example", "npm i example"].entries()) {
        writeFileSync(join(plugin, "OVERVIEW.md"), command);
        const invalidCommit = pin(`invalid-${index}`);
        provenanceCommit = invalidCommit;
        const invalid = { ...absent, repository: { ...absent.repository, commit: invalidCommit }, artifact: kind === "git" ? { ...absent.artifact, kind, remote, commit: invalidCommit, tag: `invalid-${index}`, pluginPath } : absent.artifact };
        await assert.rejects(resolvePlugin(client, invalid, "Registry stopgap"), /OVERVIEW.md.*install commands/);
        await assert.rejects(validateArtifact(client, invalid, { previous: invalid, registryOverview: "Registry stopgap" }), /OVERVIEW.md.*install commands/);
      }
      if (kind === "git") {
        rmSync(join(plugin, "OVERVIEW.md"));
        const missingBumpCommit = pin("v3");
        const registry = mkdtempSync(join(tmpdir(), "registry-import-policy-"));
        try {
          cpSync(fileURLToPath(new URL("..", import.meta.url)), join(registry, "scripts"), { recursive: true });
          cpSync(fileURLToPath(new URL("../../categories.json", import.meta.url)), join(registry, "categories.json"));
          mkdirSync(join(registry, "plugins/acme"), { recursive: true });
          const options = { cwd: registry, env: { ...process.env } };
          const commitRegistry = (message: string) => {
            run("git", ["add", "plugins"], options);
            run("git", ["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", message], options);
          };
          run("git", ["init", "-q"], options);
          run("git", ["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "--allow-empty", "-qm", "base"], options);
          run("git", ["update-ref", "refs/remotes/origin/main", "HEAD"], options);
          writeFileSync(join(registry, "plugins/acme/example.json"), serializeRecord(absent));
          writeFileSync(join(registry, "plugins/acme/example.md"), "Imported stopgap.");
          commitRegistry("import");
          const validate = (...args: string[]) => run(process.execPath, ["scripts/validate.ts", "--online", "--changed", ...args], options);
          assert.throws(() => validate(), /Command failed/);
          assert.match(validate("--allow-imports"), /1 record\(s\) match/);
          run("git", ["update-ref", "refs/remotes/origin/main", "HEAD"], options);
          writeFileSync(join(registry, "plugins/acme/example.json"), serializeRecord({ ...absent, listing: { name: "Updated name" } }));
          commitRegistry("metadata");
          assert.match(validate(), /1 record\(s\) match/);
          writeFileSync(join(registry, "plugins/acme/example.json"), serializeRecord({ ...absent, artifact: { ...absent.artifact, tag: "invalid-0", commit: run("git", ["rev-parse", "invalid-0"], { cwd: directory }) } }));
          // This next commit has an overview, but its install command is invalid.
          commitRegistry("invalid author overview");
          assert.throws(() => validate("--allow-imports"), /Command failed/);
          writeFileSync(join(registry, "plugins/acme/example.json"), serializeRecord({
            ...absent,
            artifact: { kind: "git", remote, tag: "v3", commit: missingBumpCommit, pluginPath },
          }));
          commitRegistry("bump missing author overview");
          assert.throws(() => validate(), /Command failed/);
          assert.throws(() => validate("--allow-imports"), /Command failed/);
          writeFileSync(join(registry, "plugins/acme/example.json"), serializeRecord(record));
          commitRegistry("bump with author overview and stopgap");
          assert.match(validate(), /1 record\(s\) match/);
        } finally {
          rmSync(registry, { recursive: true, force: true });
        }
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
