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
  repository: { type: "git", url: "git+https://github.com/omercnet/paseo-plugins.git", directory: "paseo-dracula" },
  dist: { integrity: "sha512-abc", tarball: "https://registry.npmjs.org/x.tgz" },
};
const record: PluginRecord = {
  id: "dracula",
  package: doc.name,
  version: doc.version,
  integrity: doc.dist.integrity,
  repository: { url: "https://github.com/omercnet/paseo-plugins/tree/HEAD/paseo-dracula", commit: "d7b3e654f364b5be72edf6fd1d914a3750b53082" },
  categories: ["themes"],
  submittedAt: "2026-09-17",
  reviewedAt: "2026-10-03",
};

test("assets in the package resolve to the pinned version on the CDN", () => {
  const plugin = mergeListing({
    record,
    doc,
    publishedAt: "2026-09-27T09:59:16.690Z",
    listingFile: parseListingFile(JSON.stringify({ name: "Dracula", icon: "icon.png", screenshots: ["./docs/a.png", "https://x.test/b.png"] })),
    readme: "# Dracula\n",
    downloads: { total: 5943, lastMonth: 5900 },
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
    downloads: null,
  });
  assert.equal(plugin.name, "Dracula");
  assert.deepEqual(plugin.screenshots, ["https://x.test/override.png"]);
  assert.equal(plugin.icon, null);
  assert.deepEqual(plugin.author, { npm: "omercnet", name: "omercnet", github: "omercnet" });
  assert.equal(plugin.readme, "");
  assert.equal(plugin.downloads, null);
});
