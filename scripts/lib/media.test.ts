import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { mergeListing, resolvePlugin } from "./listing.ts";
import { validateArtifact } from "./validate-artifact.ts";
import { parseRecord } from "./record.ts";
import type { NpmClient, VersionDoc } from "./npm.ts";
import { run } from "./shell.ts";

function fixture(t: TestContext, listing: unknown, cdnListing = listing) {
  const root = mkdtempSync(join(tmpdir(), "registry-npm-media-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "package/docs"), { recursive: true });
  writeFileSync(join(root, "package/paseo-plugin.json"), '{"id":"media"}');
  writeFileSync(join(root, "package/paseo-listing.json"), JSON.stringify(listing));
  writeFileSync(join(root, "package/icon.png"), "pinned icon");
  writeFileSync(join(root, "package/docs/screen.png"), "pinned screenshot");
  writeFileSync(join(root, "package/index.js"), 'throw new Error("Never execute plugin code");');
  symlinkSync("../../outside.png", join(root, "package/link.png"));
  const archive = join(root, "package.tgz");
  run("tar", ["-czf", archive, "package"], { cwd: root });
  const doc: VersionDoc = {
    name: "@acme/media", version: "1.0.0", repository: "https://github.com/acme/media",
    dist: { integrity: "sha512-" + createHash("sha512").update(readFileSync(archive)).digest("base64"),
      tarball: "https://registry.npmjs.org/media.tgz" },
  };
  const record = parseRecord({
    id: "acme/media", artifact: { kind: "npm", package: doc.name, version: doc.version,
      integrity: doc.dist.integrity, resolved: doc.dist.tarball },
    repository: { url: "https://github.com/acme/media" }, categories: ["utils"],
    submittedAt: "2026-10-06", reviewedAt: "2026-10-06",
  }, new Set(["utils"]));
  const client: NpmClient = {
    async packument() { return { name: doc.name, versions: { [doc.version]: doc },
      "dist-tags": { latest: "9.0.0" }, time: { [doc.version]: "2026-10-06" } }; },
    async file(name, version, path) {
      assert.equal(name, doc.name); assert.equal(version, doc.version);
      // The CDN claims every path exists, including synthesized assets and links.
      return path === "paseo-listing.json" ? JSON.stringify(cdnListing) : "CDN content";
    },
    async provenance() { return null; },
    async tarball(url, destination) { assert.equal(url, doc.dist.tarball); cpSync(archive, destination); },
  };
  return { record, client, doc };
}
const context = { registryOverview: "Imported overview.", allowNewImport: true };

test("npm media must be in the integrity-pinned tarball even when the CDN claims it exists", async (t) => {
  for (const listing of [
    { icon: "https://external.test/icon.png" },
    { screenshots: ["https://github.com/acme/media/raw/" + "a".repeat(40) + "/screen.png"] },
    { icon: "missing.png" }, { screenshots: ["docs/screen.min.svg"] }, { icon: "link.png" }, { screenshots: ["../screen.png"] },
  ]) {
    const { record, client } = fixture(t, listing);
    assert.notDeepEqual(await validateArtifact(client, record, context), [], JSON.stringify(listing));
  }
});

test("npm validates and publishes tarball listing media while keeping exact-version CDN URLs", async (t) => {
  const listing = { icon: "./icon.png", screenshots: ["docs/screen.png"] };
  const { record, client, doc } = fixture(t, listing, { icon: "https://unreviewed.test/icon.png" });
  assert.deepEqual(await validateArtifact(client, record, context), []);
  const plugin = await resolvePlugin(client, record, "Imported overview.");
  assert.equal(plugin.icon, "https://cdn.jsdelivr.net/npm/@acme/media@1.0.0/icon.png");
  assert.deepEqual(plugin.screenshots, ["https://cdn.jsdelivr.net/npm/@acme/media@1.0.0/docs/screen.png"]);
  const override = parseRecord({ ...record, listing: { icon: "icon.png", screenshots: [] } }, new Set(["utils"]));
  const overridden = mergeListing({ record: override, doc, publishedAt: "2026-10-06", listingFile: listing, readme: "Overview." });
  assert.deepEqual(overridden.screenshots, []);
  assert.deepEqual(await validateArtifact(client, override, context), []);
  const legacy = { ...record, listing: { icon: "https://external.test/icon.png", screenshots: [] } };
  assert.deepEqual(await validateArtifact(client, legacy, { ...context, previous: legacy }), []);
  const mismatched = { ...record, artifact: { ...record.artifact, integrity: "sha512-YWJj" } };
  await assert.rejects(validateArtifact(client, mismatched, context), /integrity/i);
});
