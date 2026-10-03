import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { downloadRanges, isoDate } from "./dates.ts";

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

export interface Downloads {
  total: number;
  lastMonth: number;
}

export interface NpmClient {
  packument(name: string): Promise<Packument>;
  /** A file from the published tarball at an exact version, or null when it is not in the package. */
  file(name: string, version: string, path: string): Promise<string | null>;
  /** Source facts from a verified publish attestation, or null when the version has none. */
  provenance(name: string, version: string): Promise<Provenance | null>;
  downloads(name: string, createdAt: string): Promise<Downloads>;
  tarball(url: string, destination: string): Promise<void>;
}

const REGISTRY = "https://registry.npmjs.org";
const CDN = "https://cdn.jsdelivr.net/npm";
const DOWNLOADS = "https://api.npmjs.org/downloads/point";
const USER_AGENT = "paseo-plugins-registry";

const RETRY_ATTEMPTS = 4;

export function createNpmClient(fetchImpl: typeof fetch = fetch): NpmClient {
  // The downloads API rate-limits bursts with 429; back off and retry before giving up.
  async function get(url: string): Promise<Response> {
    let response = await fetchImpl(url, { headers: { "User-Agent": USER_AGENT } });
    for (let attempt = 1; response.status === 429 && attempt < RETRY_ATTEMPTS; attempt += 1) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const delayMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** attempt;
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

  return {
    async packument(name) {
      const doc = await getJson<Packument>(`${REGISTRY}/${name}`);
      if (!doc) throw new Error(`npm package ${name} does not exist`);
      return doc;
    },
    async file(name, version, path) {
      const response = await get(`${CDN}/${name}@${version}/${path}`);
      if (response.status === 404 || response.status === 403) return null;
      if (!response.ok) throw new Error(`jsDelivr ${name}@${version}/${path} responded ${response.status}`);
      return response.text();
    },
    async provenance(name, version) {
      const encoded = name.replace("/", "%2F");
      const doc = await getJson<AttestationsDoc>(`${REGISTRY}/-/npm/v1/attestations/${encoded}@${version}`);
      return doc ? parseProvenance(doc) : null;
    },
    async downloads(name, createdAt) {
      const today = isoDate();
      const totals = await Promise.all(
        downloadRanges(createdAt, today).map(async ([start, end]) => {
          const point = await getJson<{ downloads: number }>(`${DOWNLOADS}/${start}:${end}/${name}`);
          return point?.downloads ?? 0;
        }),
      );
      const lastMonth = await getJson<{ downloads: number }>(`${DOWNLOADS}/last-month/${name}`);
      return {
        total: totals.reduce((sum, count) => sum + count, 0),
        lastMonth: lastMonth?.downloads ?? 0,
      };
    },
    async tarball(url, destination) {
      const response = await get(url);
      if (!response.ok || !response.body) throw new Error(`${url} responded ${response.status}`);
      await pipeline(Readable.fromWeb(response.body as never), createWriteStream(destination));
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
        buildDefinition?: { resolvedDependencies?: { uri?: string; digest?: { gitCommit?: string } }[] };
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
  if (!doc) throw new Error(`${packument.name}@${version} is not published`);
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
