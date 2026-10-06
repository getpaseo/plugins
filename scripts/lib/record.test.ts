import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { parseRecord, readRecords, serializeRecord, writeRecord } from "./record.ts";

const known = new Set(["themes", "utils"]);
const valid = {
  id: "omercnet/dracula",
  artifact: {
    kind: "npm",
    package: "@omercnet/paseo-dracula",
    version: "1.2.0",
    resolved: "https://registry.npmjs.org/x.tgz",
    integrity: "sha512-I3yUiFIvaIe3jAbc+/==",
  },
  repository: {
    url: "https://github.com/omercnet/paseo-plugins/tree/HEAD/paseo-dracula",
    commit: "d7b3e654f364b5be72edf6fd1d914a3750b53082",
  },
  categories: ["themes"],
  submittedAt: "2026-09-17",
  submittedBy: "omercnet",
  reviewedAt: "2026-10-03",
};

test("accepts a complete record and keeps field order when written", () => {
  const record = parseRecord(
    { ...valid, listing: { screenshots: ["https://example.com/a.png"] } },
    known,
  );
  assert.equal(record.repository?.commit, valid.repository.commit);
  const text = serializeRecord({ reviewedAt: record.reviewedAt, ...record } as typeof record);
  assert.equal(Object.keys(JSON.parse(text))[0], "id");
  assert.ok(text.endsWith("}\n"));
});

test("reports every problem at once", () => {
  assert.throws(
    () =>
      parseRecord(
        {
          ...valid,
          id: "Bad Id",
          artifact: { ...valid.artifact, integrity: "md5-x" },
          categories: ["nope"],
          extra: 1,
          repository: { url: "ftp://x" },
        },
        known,
      ),
    (error: Error) =>
      /id "Bad Id" is malformed/.test(error.message) &&
      /integrity "md5-x" is malformed/.test(error.message) &&
      /unknown category "nope"/.test(error.message) &&
      /unknown field "extra"/.test(error.message) &&
      /repository.url must be an https URL/.test(error.message),
  );
  assert.throws(
    () => parseRecord({ ...valid, listing: { icon: "https://example.com/icon.svg" } }, known),
    /listing.icon must be a relative PNG/,
  );
  assert.throws(
    () => parseRecord({ ...valid, submittedAt: "yesterday" }, known),
    /submittedAt must be YYYY-MM-DD/,
  );
});

test("rejects a directory with duplicate packages or mismatched file names", () => {
  const dir = mkdtempSync(join(tmpdir(), "records-"));
  writeRecord(parseRecord(valid, known), dir);
  writeRecord(parseRecord({ ...valid, id: "omercnet/alucard" }, known), dir);
  assert.throws(
    () => readRecords(known, dir),
    /package "@omercnet\/paseo-dracula" is listed 2 times/,
  );
  writeFileSync(
    join(dir, "omercnet/alucard.json"),
    serializeRecord(
      parseRecord(
        { ...valid, id: "omercnet/other", artifact: { ...valid.artifact, package: "other" } },
        known,
      ),
    ),
  );
  assert.throws(
    () => readRecords(known, dir),
    /alucard.json: file name must match id "omercnet\/other"/,
  );
});

test("git pins round-trip and reject mutable or escaping artifacts", () => {
  const artifact = {
    kind: "git",
    remote: "https://github.com/acme/plugin.git",
    commit: "a".repeat(40),
    tag: "v1",
    pluginPath: "plugins/example",
  };
  const record = parseRecord({ ...valid, artifact }, known);
  assert.deepEqual(JSON.parse(serializeRecord(record)).artifact, artifact);
  assert.throws(
    () => parseRecord({ ...valid, artifact: { ...artifact, commit: "HEAD" } }, known),
    /full SHA/,
  );
  assert.throws(
    () => parseRecord({ ...valid, artifact: { ...artifact, pluginPath: "../outside" } }, known),
    /relative directory/,
  );
});
