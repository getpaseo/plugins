import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { authorOf, parseProvenance, createNpmClient } from "./npm.ts";

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

// Real npm-shaped archives, served through the client's HTTP interface.
function packageFixture(t: TestContext, integrity?: string) {
  const root = mkdtempSync(join(tmpdir(), "npm-artifact-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "package"));
  writeFileSync(join(root, "package/paseo-plugin.json"), '{"id":"example"}');
  writeFileSync(join(root, "package/OVERVIEW.md"), "An overview from the package.");
  symlinkSync("/etc/passwd", join(root, "package/link"));
  const archive = execFileSync("tar", ["-czf", "-", "-C", root, "package"]);
  const url = "https://registry.npmjs.org/example/-/example-1.0.0.tgz";
  const doc = { name: "example", version: "1.0.0", dist: {
    tarball: url, integrity: integrity ?? `sha512-${createHash("sha512").update(archive).digest("base64")}`,
  } };
  const requests: string[] = [];
  const client = createNpmClient(async (input) => {
    const target = String(input);
    requests.push(target);
    if (target === url) return new Response(archive);
    if (target === "https://registry.npmjs.org/example") return Response.json({
      name: "example", "dist-tags": { latest: "1.0.0" }, versions: { "1.0.0": doc }, time: {},
    });
    return new Response("CDN unavailable", { status: 502 });
  });
  return { client, root, archive, url, requests };
}

test("package reads share one verified npm tarball, without contacting a CDN", async (t) => {
  const f = packageFixture(t);
  const files = await Promise.all([
    f.client.file("example", "1.0.0", "paseo-plugin.json"),
    f.client.file("example", "1.0.0", "OVERVIEW.md"),
    f.client.file("example", "1.0.0", "absent.md"),
  ]);
  assert.deepEqual(files, ['{"id":"example"}', "An overview from the package.", null]);
  const destination = join(f.root, "download.tgz");
  await f.client.tarball(f.url, destination);
  assert.deepEqual(readFileSync(destination), f.archive);
  assert.deepEqual(f.requests.sort(), ["https://registry.npmjs.org/example", f.url].sort());
});

test("package bytes must match npm's SHA-512 before any file is read", async (t) => {
  const f = packageFixture(t, "sha512-wrong");
  await assert.rejects(f.client.file("example", "1.0.0", "paseo-plugin.json"), /integrity/i);
});

test("package reads reject traversal and links instead of reading the host filesystem", async (t) => {
  const f = packageFixture(t);
  await assert.rejects(f.client.file("example", "1.0.0", "../outside"), /path/i);
  await assert.rejects(f.client.file("example", "1.0.0", "link"), /regular file/i);
});
