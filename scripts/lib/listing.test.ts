import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeListing, parseListingFile, resolvePlugin } from "./listing.ts";
import { validateArtifact } from "./validate-artifact.ts";
import type { VersionDoc } from "./npm.ts";
import type { PluginRecord } from "./record.ts";

const doc: VersionDoc = {
  name: "@omercnet/paseo-dracula",
  version: "1.2.0",
  description: "Dracula and Alucard themes.",
  license: "MIT",
  author: { name: "Omer Cohen <omer@example.com>" },
  maintainers: [{ name: "omercnet" }],
  repository: {
    type: "git",
    url: "git+https://github.com/omercnet/paseo-plugins.git",
    directory: "paseo-dracula",
  },
  dist: { integrity: "sha512-abc", tarball: "https://registry.npmjs.org/x.tgz" },
};
const record: PluginRecord = {
  id: "omercnet/dracula",
  artifact: {
    kind: "npm",
    package: doc.name,
    version: doc.version,
    resolved: doc.dist.tarball,
    integrity: doc.dist.integrity,
  },
  repository: {
    url: "https://github.com/omercnet/paseo-plugins/tree/HEAD/paseo-dracula",
    commit: "d7b3e654f364b5be72edf6fd1d914a3750b53082",
  },
  categories: ["themes"],
  submittedAt: "2026-09-17",
  reviewedAt: "2026-10-03",
};

test("assets in the package resolve to the pinned version on the CDN", () => {
  const plugin = mergeListing({
    record,
    doc,
    publishedAt: "2026-09-27T09:59:16.690Z",
    listingFile: parseListingFile(
      JSON.stringify({
        name: "Dracula",
        icon: "icon.png",
        screenshots: ["./docs/a.png", "https://x.test/b.png"],
      }),
    ),
    readme: "# Dracula\n",
    installs: 42,
  });
  assert.equal(plugin.name, "Dracula");
  assert.equal(plugin.icon, "https://cdn.jsdelivr.net/npm/@omercnet/paseo-dracula@1.2.0/icon.png");
  assert.deepEqual(plugin.screenshots, [
    "https://cdn.jsdelivr.net/npm/@omercnet/paseo-dracula@1.2.0/docs/a.png",
    "https://x.test/b.png",
  ]);
  assert.deepEqual(plugin.author, { npm: "omercnet", name: "Omer Cohen", github: "omercnet" });
  assert.equal(plugin.repository?.commit, record.repository?.commit);
  assert.equal(plugin.readme, "# Dracula\n");
});

test("record overrides win, and a package without a listing file gets a humanized name", () => {
  const plugin = mergeListing({
    record: { ...record, listing: { screenshots: ["https://x.test/override.png"] } },
    doc: { ...doc, author: undefined, repository: undefined },
    publishedAt: "2026-09-27T09:59:16.690Z",
    listingFile: parseListingFile(null),
    readme: null,
  });
  assert.equal(plugin.name, "Dracula");
  assert.deepEqual(plugin.screenshots, ["https://x.test/override.png"]);
  assert.equal(plugin.icon, undefined);
  assert.deepEqual(plugin.author, { npm: "omercnet", name: "omercnet", github: "omercnet" });
  assert.equal(plugin.readme, "");
  assert.equal(plugin.installs, undefined);
});

test("npm details follow the full readme precedence and skip absent files", async () => {
  const files = new Map([
    ["paseo-plugin.json", '{"id":"example"}'],
    ["paseo-listing.json", JSON.stringify({ readme: "docs/overview.md" })],
    ["docs/overview.md", "Explicit readme"],
    ["OVERVIEW.md", "Author overview"],
    ["README.md", "Default README"],
    ["readme.md", "Lowercase README"],
  ]);
  const client = {
    async packument() {
      return {
        name: doc.name,
        "dist-tags": { latest: doc.version },
        time: { [doc.version]: "2026-09-27T09:59:16.690Z" },
        versions: { [doc.version]: doc },
      };
    },
    async file(_name: string, _version: string, path: string) {
      return files.get(path) ?? null;
    },
    async provenance() {
      return null;
    },
    async tarball() {
      throw new Error("Not needed for listing resolution");
    },
  };
  assert.equal(
    (await resolvePlugin(client, record, "Registry overview")).readme,
    "Explicit readme",
  );
  files.set("docs/overview.md", "");
  assert.equal((await resolvePlugin(client, record, "Registry overview")).readme, "");
  files.delete("docs/overview.md");
  assert.equal((await resolvePlugin(client, record, "Registry overview")).readme, "Author overview");
  files.delete("paseo-listing.json");
  assert.equal((await resolvePlugin(client, record)).readme, "Author overview");
  files.set("paseo-listing.json", JSON.stringify({ readme: "docs/overview.md" }));
  files.delete("OVERVIEW.md");
  assert.equal((await resolvePlugin(client, record, "Registry overview")).readme, "Registry overview");
  assert.equal((await resolvePlugin(client, record)).readme, "Default README");
  files.delete("README.md");
  assert.equal((await resolvePlugin(client, record)).readme, "Lowercase README");
  files.delete("readme.md");
  assert.equal((await resolvePlugin(client, record)).readme, "");
  files.set("docs/overview.md", "Explicit readme");
  for (const command of ["paseo plugin add acme/example", "npm install example", "npm i example"]) {
    files.set("OVERVIEW.md", command);
    await assert.rejects(
      resolvePlugin(client, record, "Registry overview"),
      /OVERVIEW.md.*install commands/,
    );
    await assert.rejects(
      validateArtifact(client, { ...record, repository: { url: record.repository.url } }),
      /OVERVIEW.md.*install commands/,
    );
  }
  files.set("OVERVIEW.md", "");
  files.delete("docs/overview.md");
  assert.equal((await resolvePlugin(client, record, "Registry overview")).readme, "");
});

test("a tagged monorepo artifact is pinned, validated and built through both submission syntaxes", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } =
    await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const { run } = await import("./shell.ts");
  const directory = mkdtempSync(join(tmpdir(), "registry-monorepo-test-"));
  const repository = join(directory, "repository");
  const registry = join(directory, "registry");
  const pluginPath = "packages/example";
  try {
    run("git", ["init", "-q", repository]);
    mkdirSync(join(repository, pluginPath), { recursive: true });
    writeFileSync(
      join(repository, pluginPath, "paseo-plugin.json"),
      JSON.stringify({ id: "example", description: "Pinned monorepo example" }),
    );
    writeFileSync(join(repository, pluginPath, "README.md"), "# Monorepo example\n");
    writeFileSync(
      join(repository, pluginPath, "paseo-listing.json"),
      JSON.stringify({ screenshots: ["screen.png"] }),
    );
    writeFileSync(join(repository, "README.md"), "Wrong root README");
    run("git", ["add", "."], { cwd: repository });
    run(
      "git",
      ["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "fixture"],
      { cwd: repository },
    );
    run("git", ["tag", "v1.0.0"], { cwd: repository });
    const commit = run("git", ["rev-parse", "HEAD"], { cwd: repository });
    writeFileSync(join(repository, pluginPath, "README.md"), "Unreviewed HEAD");
    run("git", ["add", "."], { cwd: repository });
    run(
      "git",
      ["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "unreleased"],
      { cwd: repository },
    );
    mkdirSync(join(registry, "plugins"), { recursive: true });
    cpSync(fileURLToPath(new URL("..", import.meta.url)), join(registry, "scripts"), {
      recursive: true,
    });
    cpSync(
      fileURLToPath(new URL("../../categories.json", import.meta.url)),
      join(registry, "categories.json"),
    );
    const options = {
      cwd: registry,
      env: {
        ...process.env,
        INSTALLS_URL: "data:application/json,%7B%7D",
        GIT_CONFIG_COUNT: "1",
        GIT_CONFIG_KEY_0: `url.file://${repository}.insteadOf`,
        GIT_CONFIG_VALUE_0: "https://github.com/acme/plugins.git",
      },
    };
    run(
      process.execPath,
      ["scripts/add.ts", "acme/plugins:packages/example", "--categories", "themes"],
      options,
    );
    run(
      process.execPath,
      [
        "scripts/add.ts",
        "https://github.com/acme/plugins",
        "--plugin-path",
        pluginPath,
        "--id",
        "acme/url-example",
        "--categories",
        "themes",
      ],
      options,
    );
    assert.match(
      run(process.execPath, ["scripts/validate.ts", "--online"], options),
      /2 record\(s\) match/,
    );
    run(process.execPath, ["scripts/build.ts"], options);
    for (const slug of ["example", "url-example"]) {
      const detail = JSON.parse(
        readFileSync(join(registry, `dist/plugins/acme/${slug}.json`), "utf8"),
      );
      assert.equal(detail.readme, "# Monorepo example\n");
      assert.equal(detail.description, "Pinned monorepo example");
      assert.equal(detail.artifact.pluginPath, pluginPath);
      assert.equal(detail.artifact.commit, commit);
      assert.deepEqual(detail.screenshots, [
        `https://github.com/acme/plugins/raw/${commit}/${pluginPath}/screen.png`,
      ]);
    }
    const overview = join(registry, "plugins/acme/example.md");
    writeFileSync(overview, "# Example\n\nA curated description.\n");
    run(process.execPath, ["scripts/build.ts"], options);
    assert.equal(
      JSON.parse(readFileSync(join(registry, "dist/plugins/acme/example.json"), "utf8")).readme,
      "# Example\n\nA curated description.\n",
    );
    assert.match(run(process.execPath, ["scripts/validate.ts"], options), /2 record\(s\)/);
    run("git", ["init", "-q"], options);
    run("git", ["add", "plugins"], options);
    run(
      "git",
      ["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "records"],
      options,
    );
    run("git", ["update-ref", "refs/remotes/origin/main", "HEAD"], options);
    writeFileSync(overview, "An updated curated description.");
    run("git", ["add", "plugins/acme/example.md"], options);
    run(
      "git",
      ["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "overview"],
      options,
    );
    assert.match(
      run(process.execPath, ["scripts/validate.ts", "--online", "--changed"], options),
      /1 record\(s\) match/,
    );
    for (const command of ["paseo plugin add acme/example", "npm install example", "npm i example"]) {
      writeFileSync(overview, command);
      assert.throws(() => run(process.execPath, ["scripts/validate.ts"], options), /Command failed/);
    }
    writeFileSync(overview, "A curated description.");
    run("git", ["tag", "-f", "v1.0.0"], { cwd: repository });
    assert.throws(
      () => run(process.execPath, ["scripts/validate.ts", "--online"], options),
      /Command failed/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("git monorepo details follow the full readme chain and validate raw author overviews", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { run } = await import("./shell.ts");
  const directory = mkdtempSync(join(tmpdir(), "registry-overview-test-"));
  const pluginPath = "packages/example";
  const plugin = join(directory, pluginPath);
  const keys = ["GIT_CONFIG_COUNT", "GIT_CONFIG_KEY_0", "GIT_CONFIG_VALUE_0"];
  const previous = keys.map((key) => process.env[key]);
  try {
    run("git", ["init", "-q", directory]);
    mkdirSync(join(plugin, "docs"), { recursive: true });
    writeFileSync(join(plugin, "paseo-plugin.json"), '{"id":"example"}');
    writeFileSync(join(plugin, "paseo-listing.json"), '{"readme":"docs/detail.md"}');
    writeFileSync(join(directory, "OVERVIEW.md"), "npm install wrong-root");
    writeFileSync(join(plugin, "docs/detail.md"), "Explicit readme");
    writeFileSync(join(plugin, "OVERVIEW.md"), "Author overview");
    writeFileSync(join(plugin, "README.md"), "Default README");
    writeFileSync(join(plugin, "readme.md"), "Lowercase README");
    process.env.GIT_CONFIG_COUNT = "1";
    process.env.GIT_CONFIG_KEY_0 = `url.file://${directory}.insteadOf`;
    process.env.GIT_CONFIG_VALUE_0 = "https://github.com/acme/overview.git";
    const pin = () => {
      run("git", ["add", "."], { cwd: directory });
      run(
        "git",
        ["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "fixture"],
        { cwd: directory },
      );
      run("git", ["tag", "-f", "v1"], { cwd: directory });
      return {
        ...record,
        id: "acme/example",
        repository: { url: "https://github.com/acme/overview" },
        artifact: {
          kind: "git" as const,
          remote: "https://github.com/acme/overview.git",
          tag: "v1",
          commit: run("git", ["rev-parse", "HEAD"], { cwd: directory }),
          pluginPath,
        },
      };
    };
    // Git resolution never uses the npm client.
    const { createNpmClient } = await import("./npm.ts");
    const client = createNpmClient();
    const check = async (expected: string, overview: string | null = "Registry overview") => {
      assert.equal((await resolvePlugin(client, pin(), overview)).readme, expected);
    };
    await check("Explicit readme");
    writeFileSync(join(plugin, "docs/detail.md"), "");
    await check("");
    rmSync(join(plugin, "docs/detail.md"));
    await check("Author overview");
    rmSync(join(plugin, "paseo-listing.json"));
    await check("Author overview");
    rmSync(join(plugin, "OVERVIEW.md"));
    await check("Registry overview");
    // New pins require a changed artifact, so exercise README fallback with a missing explicit path.
    writeFileSync(join(plugin, "paseo-listing.json"), '{"readme":"missing.md"}');
    await check("Default README", null);
    rmSync(join(plugin, "README.md"));
    await check("Lowercase README", null);
    rmSync(join(plugin, "readme.md"));
    await check("", null);
    writeFileSync(join(plugin, "docs/detail.md"), "Explicit readme");
    writeFileSync(join(plugin, "paseo-listing.json"), '{"readme":"docs/detail.md"}');
    for (const command of ["paseo plugin add acme/example", "npm install example", "npm i example"]) {
      writeFileSync(join(plugin, "OVERVIEW.md"), command);
      const pinned = pin();
      await assert.rejects(
        resolvePlugin(client, pinned, "Registry overview"),
        /OVERVIEW.md.*install commands/,
      );
      await assert.rejects(validateArtifact(client, pinned), /OVERVIEW.md.*install commands/);
    }
  } finally {
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
    rmSync(directory, { recursive: true, force: true });
  }
});
