import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeListing, parseListingFile } from "./listing.ts";
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

test("a tagged Git artifact validates and builds from its exact checkout", async () => {
  const { mkdtempSync, writeFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { run } = await import("./shell.ts");
  const { parseRecord } = await import("./record.ts");
  const { resolvePlugin } = await import("./listing.ts");
  const { createNpmClient } = await import("./npm.ts");
  const directory = mkdtempSync(join(tmpdir(), "registry-git-test-"));
  const keys = ["GIT_CONFIG_COUNT", "GIT_CONFIG_KEY_0", "GIT_CONFIG_VALUE_0"];
  const previous = keys.map((key) => process.env[key]);
  try {
    run("git", ["init", "-q", directory]);
    writeFileSync(
      join(directory, "paseo-plugin.json"),
      JSON.stringify({ id: "example", description: "Git example" }),
    );
    writeFileSync(join(directory, "README.md"), "# Git example\n");
    run("git", ["add", "."], { cwd: directory });
    run(
      "git",
      ["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "fixture"],
      { cwd: directory },
    );
    run("git", ["tag", "v1.0.0"], { cwd: directory });
    const commit = run("git", ["rev-parse", "HEAD"], { cwd: directory }).trim();
    process.env.GIT_CONFIG_COUNT = "1";
    process.env.GIT_CONFIG_KEY_0 = `url.file://${directory}.insteadOf`;
    process.env.GIT_CONFIG_VALUE_0 = "https://github.com/acme/example.git";
    const gitRecord = parseRecord(
      {
        ...record,
        id: "acme/example",
        repository: { url: "https://github.com/acme/example", commit },
        artifact: {
          kind: "git",
          remote: "https://github.com/acme/example.git",
          commit,
          tag: "v1.0.0",
        },
      },
      new Set(["themes"]),
    );
    const detail = await resolvePlugin(createNpmClient(), gitRecord);
    assert.equal(detail.readme, "# Git example\n");
    assert.equal(detail.description, "Git example");
    assert.deepEqual(detail.artifact, gitRecord.artifact);
    assert.equal(detail.author.github, "acme");
  } finally {
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
    rmSync(directory, { recursive: true, force: true });
  }
});
