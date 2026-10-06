import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeListing } from "./listing.ts";
import { validateArtifact } from "./validate-artifact.ts";
import { parseRecord } from "./record.ts";
import type { NpmClient, VersionDoc } from "./npm.ts";

const doc: VersionDoc = {
  name: "@acme/media", version: "1.0.0", repository: "https://github.com/acme/media",
  dist: { integrity: "sha512-YWJj", tarball: "https://registry.npmjs.org/media.tgz" },
};
const record = parseRecord({
  id: "acme/media", artifact: { kind: "npm", package: doc.name, version: doc.version,
    integrity: doc.dist.integrity, resolved: doc.dist.tarball },
  repository: { url: "https://github.com/acme/media" }, categories: ["utils"],
  submittedAt: "2026-10-06", reviewedAt: "2026-10-06",
}, new Set(["utils"]));

// A supplied NpmClient represents the same package-file interface used by validation.
function packageClient(listing: unknown): NpmClient {
  const files = new Map([
    ["paseo-plugin.json", '{"id":"media"}'],
    ["paseo-listing.json", JSON.stringify(listing)],
    ["icon.png", "pinned image"], ["docs/screen.png", "pinned screenshot"],
  ]);
  return {
    async packument() { return { name: doc.name, versions: { [doc.version]: doc },
      "dist-tags": { latest: "9.0.0" }, time: {} }; },
    async file(name, version, path) {
      assert.equal(name, doc.name); assert.equal(version, doc.version);
      return files.get(path) ?? null;
    },
    async provenance() { return null; },
    async tarball() { throw new Error("Plugin code must never execute"); },
  };
}

test("npm new pins validate effective relative media and preserve exact-version publication", async () => {
  const context = { registryOverview: "Imported overview.", allowNewImport: true };
  for (const listing of [
    { icon: "https://external.test/icon.png" },
    { screenshots: ["https://github.com/acme/media/raw/" + "a".repeat(40) + "/screen.png"] },
    { icon: "missing.png" }, { screenshots: ["../screen.png"] },
  ]) assert.notDeepEqual(await validateArtifact(packageClient(listing), record, context), []);
  const listing = { icon: "./icon.png", screenshots: ["docs/screen.png"] };
  const client = packageClient(listing);
  assert.deepEqual(await validateArtifact(client, record, context), []);
  const plugin = mergeListing({ record, doc, publishedAt: "2026-10-06", listingFile: listing, readme: "Overview." });
  assert.equal(plugin.icon, "https://cdn.jsdelivr.net/npm/@acme/media@1.0.0/icon.png");
  assert.deepEqual(plugin.screenshots, ["https://cdn.jsdelivr.net/npm/@acme/media@1.0.0/docs/screen.png"]);
  const override = parseRecord({ ...record, listing: { icon: "icon.png", screenshots: [] } }, new Set(["utils"]));
  assert.deepEqual(await validateArtifact(packageClient({ icon: "https://external.test/icon.png", screenshots: ["https://external.test/screen.png"] }), override, context), []);
  const legacy = { ...record, listing: { icon: "https://external.test/icon.png", screenshots: [] } };
  assert.deepEqual(await validateArtifact(client, legacy, { ...context, previous: legacy }), []);
});
