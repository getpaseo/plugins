import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { parseRecord, readRecords, recordDateProblems, serializeRecord, writeRecord } from "./record.ts";

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
  publishedAt: "2026-09-20",
  reviewedAt: "2026-10-03",
};

test("media overrides require absolute https URLs", () => {
  for (const entry of ["http://example.com/screen.png", "screen.png", "//example.com/screen.png", ""]) {
    assert.throws(
      () => parseRecord({ ...valid, listing: { media: [entry] } }, known),
      /listing.media/,
    );
  }
  const media = ["https://raw.githubusercontent.com/acme/plugin/main/screen.png", "https://example.com/screen.png"];
  assert.deepEqual(parseRecord({ ...valid, listing: { media } }, known).listing?.media, media);
});

test("accepts a complete record and keeps field order when written", () => {
  const record = parseRecord(
    { ...valid, listing: { media: ["https://example.com/a.png"] } },
    known,
  );
  assert.equal(record.repository?.commit, valid.repository.commit);
  const text = serializeRecord({ reviewedAt: record.reviewedAt, ...record } as typeof record);
  assert.equal(Object.keys(JSON.parse(text))[0], "id");
  assert.ok(text.endsWith("}\n"));
});

test("media accepts images and videos; the old screenshots field and invalid entries are rejected", () => {
  const media = ["https://example.test/demo.webm", "https://example.test/card.JPG?size=2"];
  assert.deepEqual(parseRecord({ ...valid, listing: { media } }, known).listing?.media, media);
  assert.throws(() => parseRecord({ ...valid, listing: { screenshots: [] } }, known), /unknown field "listing.screenshots"/);
  for (const url of ["screen.png", "http://example.test/screen.png", "https://example.test/screen.svg"])
    assert.throws(() => parseRecord({ ...valid, listing: { media: [url] } }, known), (error: Error) => error.message.includes(url));
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
    /listing.icon must be an https PNG/,
  );
  assert.throws(
    () => parseRecord({ ...valid, listing: { description: " " } }, known),
    /listing.description must be a non-empty string/,
  );
  assert.throws(
    () => parseRecord({ ...valid, submittedAt: "yesterday" }, known),
    /submittedAt must be YYYY-MM-DD or an ISO 8601 timestamp/,
  );
});

test("record dates accept a day or a zoned ISO 8601 timestamp", () => {
  for (const date of ["2026-10-12", "2026-10-12T11:42:00Z", "2026-10-12T11:42:00.123+02:00"]) {
    const record = parseRecord({ ...valid, submittedAt: date, publishedAt: date, reviewedAt: date }, known);
    assert.equal(record.submittedAt, date);
    assert.equal(record.publishedAt, date);
    assert.equal(record.reviewedAt, date);
  }
  for (const date of ["2026-10-12T11:42:00", "2026-10-12 11:42:00Z", "2026-13-01"]) {
    assert.throws(() => parseRecord({ ...valid, reviewedAt: date }, known), /reviewedAt must be/);
    assert.throws(() => parseRecord({ ...valid, publishedAt: date }, known), /publishedAt must be/);
  }
});

test("a new record must carry the time on every date", () => {
  const stamped = { submittedAt: "2026-10-12T09:15:00Z", publishedAt: "2026-10-12T11:42:00Z", reviewedAt: "2026-10-12T11:42:00Z" };
  assert.deepEqual(recordDateProblems(parseRecord({ ...valid, ...stamped }, known), undefined), []);
  assert.deepEqual(
    recordDateProblems(parseRecord({ ...valid, ...stamped, publishedAt: "2026-10-12", reviewedAt: "2026-10-12" }, known), undefined)
      .map((problem) => problem.split(",")[0]),
    ["publishedAt must be a UTC timestamp", "reviewedAt must be a UTC timestamp"],
  );
});

test("an update keeps the submission and first listing times and stamps the new review", () => {
  const listed = { ...valid };
  const bumped = parseRecord({ ...valid, reviewedAt: "2026-10-14T05:17:03Z" }, known);
  assert.deepEqual(recordDateProblems(bumped, listed), []);
  assert.deepEqual(recordDateProblems(parseRecord({ ...valid, listing: { name: "Dracula" } }, known), listed), []);
  assert.deepEqual(recordDateProblems(parseRecord({ ...valid, reviewedAt: "2026-10-14" }, known), listed)
    .map((problem) => problem.split(",")[0]), ["reviewedAt must be a UTC timestamp"]);
  assert.deepEqual(recordDateProblems(parseRecord({ ...bumped, publishedAt: "2026-10-14T05:17:03Z" }, known), listed),
    ['publishedAt must stay "2026-09-20"; an update moves reviewedAt only']);
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
