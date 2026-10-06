import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeListing, parseListingFile, resolvePlugin } from "./listing.ts";
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
    listingFile: parseListingFile(
      JSON.stringify({
        name: "Dracula",
        icon: "icon.png",
        media: ["https://x.test/a.mp4", "https://x.test/b.png"],
      }),
    ),
    readme: "# Dracula\n",
    installs: 42,
  });
  assert.equal(plugin.name, "Dracula");
  assert.equal(plugin.icon, "https://cdn.jsdelivr.net/npm/@omercnet/paseo-dracula@1.2.0/icon.png");
  assert.deepEqual(plugin.media, [
    "https://x.test/a.mp4",
    "https://x.test/b.png",
  ]);
  assert.deepEqual(plugin.author, { npm: "omercnet", name: "Omer Cohen", github: "omercnet" });
  assert.equal(plugin.repository?.commit, record.repository?.commit);
  assert.equal(plugin.readme, "# Dracula\n");
});

test("record overrides win, and a package without a listing file gets a humanized name", () => {
  const plugin = mergeListing({
    record: { ...record, listing: { media: ["https://x.test/override.png"] } },
    doc: { ...doc, author: undefined, repository: undefined },
    listingFile: parseListingFile(null),
    readme: null,
  });
  assert.equal(plugin.name, "Dracula");
  assert.deepEqual(plugin.media, ["https://x.test/override.png"]);
  assert.equal(plugin.icon, undefined);
  assert.deepEqual(plugin.author, { npm: "omercnet", name: "omercnet", github: "omercnet" });
  assert.equal(plugin.readme, "");
  assert.equal(plugin.installs, undefined);
});

test("publication date comes from the record review date, not the npm release", () => {
  const plugin = mergeListing({
    record,
    doc,
    listingFile: {},
    readme: "Overview.",
  });
  assert.equal(plugin.publishedAt, "2026-10-03T00:00:00.000Z");
  assert.equal(plugin.updatedAt, "2026-10-03T00:00:00.000Z");
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
    writeFileSync(join(repository, pluginPath, "OVERVIEW.md"), "Monorepo example overview.\n");
    writeFileSync(join(repository, pluginPath, "README.md"), "Wrong README");
    writeFileSync(
      join(repository, pluginPath, "paseo-listing.json"),
      JSON.stringify({ media: [] }),
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
    writeFileSync(join(repository, pluginPath, "OVERVIEW.md"), "Unreviewed HEAD");
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
      ["scripts/add.ts", "acme/plugins:packages/example", "--categories", "utils"],
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
        "utils",
      ],
      options,
    );
    run("git", ["init", "-q"], options);
    run("git", ["add", "plugins"], options);
    run(
      "git",
      ["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "records"],
      options,
    );
    run("git", ["update-ref", "refs/remotes/origin/main", "HEAD"], options);
    assert.match(
      run(process.execPath, ["scripts/validate.ts", "--online"], options),
      /2 record\(s\) match/,
    );
    run(process.execPath, ["scripts/build.ts"], options);
    for (const slug of ["example", "url-example"]) {
      const detail = JSON.parse(
        readFileSync(join(registry, `dist/plugins/acme/${slug}.json`), "utf8"),
      );
      assert.equal(detail.readme, "Monorepo example overview.\n");
      assert.equal(detail.description, "Pinned monorepo example");
      assert.equal(detail.artifact.pluginPath, pluginPath);
      assert.equal(detail.artifact.commit, commit);
      assert.deepEqual(detail.media, []);
    }
    const overview = join(registry, "plugins/acme/example.md");
    writeFileSync(overview, "# Example\n\nA curated description.\n");
    run(process.execPath, ["scripts/build.ts"], options);
    assert.equal(
      JSON.parse(readFileSync(join(registry, "dist/plugins/acme/example.json"), "utf8")).readme,
      "Monorepo example overview.\n",
    );
    assert.match(run(process.execPath, ["scripts/validate.ts"], options), /2 record\(s\)/);
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
