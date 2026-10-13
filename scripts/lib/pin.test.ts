import assert from "node:assert/strict";
import { test } from "node:test";
import type { NpmClient, VersionDoc } from "./npm.ts";
import { pinRecord, repinRecord } from "./pin.ts";

const version = (number: string): VersionDoc => ({
  name: "@acme/paseo-example",
  version: number,
  repository: { type: "git", url: "git+https://github.com/acme/paseo-example.git" },
  dist: { integrity: "sha512-abc", tarball: `https://registry.npmjs.org/x-${number}.tgz` },
});
const client: NpmClient = {
  async packument() {
    return {
      name: "@acme/paseo-example", "dist-tags": { latest: "1.1.0" },
      versions: { "1.0.0": version("1.0.0"), "1.1.0": version("1.1.0") }, time: {},
    };
  },
  async file(_name, _version, path) { return path === "paseo-plugin.json" ? "{}" : null; },
  async provenance() { return null; },
  async tarball() { throw new Error("Not needed"); },
};

test("a new record is stamped to the second, so same-day listings keep their order", async () => {
  const record = await pinRecord(client, { id: "example", package: "@acme/paseo-example", categories: ["utils"] }, { version: "1.0.0" });
  assert.match(record.submittedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  assert.equal(record.publishedAt, record.submittedAt);
  assert.equal(record.reviewedAt, record.submittedAt);
});

test("a bump moves the review time and keeps the submission and first listing times", async () => {
  const listed = await pinRecord(
    client,
    { id: "example", package: "@acme/paseo-example", categories: ["utils"] },
    { version: "1.0.0", submittedAt: "2026-10-12T09:15:00Z", now: "2026-10-12T11:42:00Z" },
  );
  const bumped = await repinRecord(client, listed, "1.1.0", "2026-10-14T05:17:03Z");
  assert.equal(bumped.artifact.kind === "npm" && bumped.artifact.version, "1.1.0");
  assert.equal(bumped.submittedAt, "2026-10-12T09:15:00Z");
  assert.equal(bumped.publishedAt, "2026-10-12T11:42:00Z");
  assert.equal(bumped.reviewedAt, "2026-10-14T05:17:03Z");
});
