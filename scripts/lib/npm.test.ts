import assert from "node:assert/strict";
import { test } from "node:test";
import { downloadRanges } from "./dates.ts";
import { authorOf, parseProvenance } from "./npm.ts";

function envelope(predicateType: string, statement: unknown) {
  return { predicateType, bundle: { dsseEnvelope: { payload: Buffer.from(JSON.stringify(statement)).toString("base64") } } };
}

test("reads repository and commit from SLSA v1 and v0.2 provenance", () => {
  const v1 = parseProvenance({
    attestations: [
      envelope("https://github.com/npm/attestation/tree/main/specs/publish/v0.1", { predicate: {} }),
      envelope("https://slsa.dev/provenance/v1", {
        predicate: {
          buildDefinition: {
            resolvedDependencies: [
              { uri: "git+https://github.com/omercnet/paseo-plugins@refs/heads/main", digest: { gitCommit: "d7b3e654f364b5be72edf6fd1d914a3750b53082" } },
            ],
          },
        },
      }),
    ],
  });
  assert.deepEqual(v1, { repositoryUrl: "https://github.com/omercnet/paseo-plugins", commit: "d7b3e654f364b5be72edf6fd1d914a3750b53082" });

  const v02 = parseProvenance({
    attestations: [
      envelope("https://slsa.dev/provenance/v0.2", {
        predicate: { materials: [{ uri: "git+https://github.com/acme/plugin@refs/tags/v1.0.0", digest: { sha1: "0123456789012345678901234567890123456789" } }] },
      }),
    ],
  });
  assert.deepEqual(v02, { repositoryUrl: "https://github.com/acme/plugin", commit: "0123456789012345678901234567890123456789" });
  assert.equal(parseProvenance({ attestations: [] }), null);
});

test("splits download queries into spans npm accepts", () => {
  assert.deepEqual(downloadRanges("2026-09-22", "2026-10-03"), [["2026-09-22", "2026-10-03"]]);
  const spans = downloadRanges("2024-01-01", "2026-10-03");
  assert.equal(spans[0][0], "2024-01-01");
  assert.equal(spans.at(-1)?.[1], "2026-10-03");
  assert.equal(spans.length, 2);
  for (const [start, end] of spans) {
    const days = (Date.parse(end) - Date.parse(start)) / 86_400_000 + 1;
    assert.ok(days <= 540, `${start}..${end} spans ${days} days`);
  }
  for (let i = 1; i < spans.length; i += 1) {
    const previousEnd = new Date(spans[i - 1][1]);
    previousEnd.setUTCDate(previousEnd.getUTCDate() + 1);
    assert.equal(spans[i][0], previousEnd.toISOString().slice(0, 10));
  }
});

test("prefers the declared author name and falls back to the npm user", () => {
  const dist = { integrity: "sha512-x", tarball: "t" };
  assert.deepEqual(authorOf({ name: "a", version: "1", author: "Tom Gringauz <t@x.test> (https://x.test)", _npmUser: { name: "tomgrin10" }, dist }), { npm: "tomgrin10", name: "Tom Gringauz" });
  assert.deepEqual(authorOf({ name: "a", version: "1", maintainers: [{ name: "omercnet" }], dist }), { npm: "omercnet", name: "omercnet" });
  assert.deepEqual(
    authorOf({ name: "a", version: "1", _npmUser: { name: "GitHub Actions", trustedPublisher: { id: "github" } }, maintainers: [{ name: "gpambrozio" }], dist }),
    { npm: "gpambrozio", name: "gpambrozio" },
  );
});
