import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { readPackageFile } from "./npm-artifact.ts";
import { AuthorError } from "./problems.ts";

export interface VersionDoc {
  name: string;
  version: string;
  description?: string;
  license?: string;
  author?: string | { name?: string; email?: string; url?: string };
  maintainers?: { name: string; email?: string }[];
  _npmUser?: { name: string; trustedPublisher?: unknown };
  repository?: string | { type?: string; url?: string; directory?: string };
  dist: { integrity: string; tarball: string; attestations?: { url: string } };
}

export interface Packument {
  name: string;
  "dist-tags": Record<string, string>;
  time: Record<string, string>;
  versions: Record<string, VersionDoc>;
}

export interface Provenance {
  repositoryUrl: string;
  commit: string;
}

export interface NpmClient {
  packument(name: string): Promise<Packument>;
  /** A file from the published tarball at an exact version, or null when it is not in the package. */
  file(name: string, version: string, path: string): Promise<string | null>;
  /** Source facts from a verified publish attestation, or null when the version has none. */
  provenance(name: string, version: string): Promise<Provenance | null>;
  tarball(url: string, destination: string): Promise<void>;
}

const REGISTRY = "https://registry.npmjs.org";
const USER_AGENT = "paseo-plugins-registry";

const RETRY_ATTEMPTS = 4;

export function createNpmClient(fetchImpl: typeof fetch = fetch): NpmClient {
  // Retry package hosts when rate limited.
  async function get(url: string): Promise<Response> {
    let response = await fetchImpl(url, { headers: { "User-Agent": USER_AGENT } });
    for (let attempt = 1; response.status === 429 && attempt < RETRY_ATTEMPTS; attempt += 1) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const delayMs =
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      response = await fetchImpl(url, { headers: { "User-Agent": USER_AGENT } });
    }
    return response;
  }

  async function getJson<T>(url: string): Promise<T | null> {
    const response = await get(url);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`${url} responded ${response.status}`);
    return (await response.json()) as T;
  }

  // A client owns one snapshot of metadata and bytes for each artifact. Concurrent
  // reads share the same request; tarball diff consumers reuse these bytes too.
  const metadata = new Map<string, Promise<Packument>>();
  const downloads = new Map<string, Promise<Buffer>>();
  const packages = new Map<string, Promise<Buffer>>();
  function packument(name: string): Promise<Packument> {
    if (!metadata.has(name)) metadata.set(name, (async () => {
      const doc = await getJson<Packument>(`${REGISTRY}/${name}`);
      if (!doc) throw new AuthorError(`npm package ${name} does not exist. Check the Source field or publish the package publicly on npm.`);
      return doc;
    })());
    return metadata.get(name)!;
  }
  function download(url: string): Promise<Buffer> {
    if (!downloads.has(url)) downloads.set(url, (async () => {
      const response = await get(url);
      if (!response.ok) throw new Error(`${url} responded ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    })());
    return downloads.get(url)!;
  }
  function artifact(name: string, version: string): Promise<Buffer> {
    const key = `${name}@${version}`;
    if (!packages.has(key)) packages.set(key, (async () => {
      const doc = resolveVersion(await packument(name), version);
      const bytes = await download(doc.dist.tarball);
      const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
      if (integrity !== doc.dist.integrity) throw new Error(`${key}: downloaded tarball integrity does not match npm`);
      return bytes;
    })());
    return packages.get(key)!;
  }

  return {
    packument,
    async file(name, version, path) {
      return readPackageFile(await artifact(name, version), path);
    },
    async provenance(name, version) {
      const encoded = name.replace("/", "%2F");
      const doc = await getJson<AttestationsDoc>(
        `${REGISTRY}/-/npm/v1/attestations/${encoded}@${version}`,
      );
      return doc ? parseProvenance(doc) : null;
    },
    async tarball(url, destination) {
      await writeFile(destination, await download(url));
    },
  };
}

interface AttestationsDoc {
  attestations: { predicateType: string; bundle: { dsseEnvelope: { payload: string } } }[];
}

/** Reads the source repository and commit out of a SLSA provenance statement. */
export function parseProvenance(doc: AttestationsDoc): Provenance | null {
  for (const attestation of doc.attestations ?? []) {
    if (!attestation.predicateType.startsWith("https://slsa.dev/provenance/")) continue;
    const statement = JSON.parse(
      Buffer.from(attestation.bundle.dsseEnvelope.payload, "base64").toString("utf8"),
    ) as {
      predicate?: {
        buildDefinition?: {
          resolvedDependencies?: { uri?: string; digest?: { gitCommit?: string } }[];
        };
        materials?: { uri?: string; digest?: { sha1?: string } }[];
      };
    };
    const dependency = statement.predicate?.buildDefinition?.resolvedDependencies?.[0];
    const material = statement.predicate?.materials?.[0];
    const uri = dependency?.uri ?? material?.uri;
    const commit = dependency?.digest?.gitCommit ?? material?.digest?.sha1;
    if (!uri || !commit) continue;
    const repositoryUrl = uri.replace(/^git\+/, "").replace(/@refs\/.*$/, "");
    return { repositoryUrl, commit };
  }
  return null;
}

export function resolveVersion(packument: Packument, requested?: string): VersionDoc {
  const version = requested ?? packument["dist-tags"].latest;
  const doc = packument.versions[version];
  if (!doc) throw new AuthorError(`${packument.name}@${version} is not published. Publish a version and set the npm latest tag to it.`);
  return doc;
}

export function authorOf(doc: VersionDoc): { npm: string; name: string } {
  // Trusted publishing records "GitHub Actions" as the publisher, so the maintainer list is the person.
  const publisher = doc._npmUser && !doc._npmUser.trustedPublisher ? doc._npmUser.name : undefined;
  const npm = publisher ?? doc.maintainers?.[0]?.name ?? "unknown";
  const declared = typeof doc.author === "string" ? doc.author : doc.author?.name;
  const name = declared?.replace(/\s*<[^>]*>|\s*\([^)]*\)/g, "").trim();
  return { npm, name: name || npm };
}
