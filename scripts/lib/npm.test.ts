import assert from "node:assert/strict";
import { test } from "node:test";
import { authorOf, parseProvenance } from "./npm.ts";

function envelope(predicateType: string, statement: unknown) {
  return {
    predicateType,
    bundle: {
      dsseEnvelope: { payload: Buffer.from(JSON.stringify(statement)).toString("base64") },
    },
  };
}

test("reads repository and commit from SLSA v1 and v0.2 provenance", () => {
  const v1 = parseProvenance({
    attestations: [
      envelope("https://github.com/npm/attestation/tree/main/specs/publish/v0.1", {
        predicate: {},
      }),
      envelope("https://slsa.dev/provenance/v1", {
        predicate: {
          buildDefinition: {
            resolvedDependencies: [
              {
                uri: "git+https://github.com/omercnet/paseo-plugins@refs/heads/main",
                digest: { gitCommit: "d7b3e654f364b5be72edf6fd1d914a3750b53082" },
              },
            ],
          },
        },
      }),
    ],
  });
  assert.deepEqual(v1, {
    repositoryUrl: "https://github.com/omercnet/paseo-plugins",
    commit: "d7b3e654f364b5be72edf6fd1d914a3750b53082",
  });

  const v02 = parseProvenance({
    attestations: [
      envelope("https://slsa.dev/provenance/v0.2", {
        predicate: {
          materials: [
            {
              uri: "git+https://github.com/acme/plugin@refs/tags/v1.0.0",
              digest: { sha1: "0123456789012345678901234567890123456789" },
            },
          ],
        },
      }),
    ],
  });
  assert.deepEqual(v02, {
    repositoryUrl: "https://github.com/acme/plugin",
    commit: "0123456789012345678901234567890123456789",
  });
  assert.equal(parseProvenance({ attestations: [] }), null);
});

test("prefers the declared author name and falls back to the npm user", () => {
  const dist = { integrity: "sha512-x", tarball: "t" };
  assert.deepEqual(
    authorOf({
      name: "a",
      version: "1",
      author: "Tom Gringauz <t@x.test> (https://x.test)",
      _npmUser: { name: "tomgrin10" },
      dist,
    }),
    { npm: "tomgrin10", name: "Tom Gringauz" },
  );
  assert.deepEqual(
    authorOf({ name: "a", version: "1", maintainers: [{ name: "omercnet" }], dist }),
    { npm: "omercnet", name: "omercnet" },
  );
  assert.deepEqual(
    authorOf({
      name: "a",
      version: "1",
      _npmUser: { name: "GitHub Actions", trustedPublisher: { id: "github" } },
      maintainers: [{ name: "gpambrozio" }],
      dist,
    }),
    { npm: "gpambrozio", name: "gpambrozio" },
  );
});
