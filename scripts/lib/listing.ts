import { readAuthorOverview, requireOverview } from "./overview.ts";
import type { Category } from "./categories.ts";
import { authorOf, type NpmClient, resolveVersion, type VersionDoc } from "./npm.ts";
import { artifactFileExists, readOptional, withGitArtifact } from "./git-artifact.ts";
import { mediaPath, type PluginRecord } from "./record.ts";

/** What paseo-listing.json in the package may declare. */
export interface ListingFile {
  name?: string;
  icon?: string;
  screenshots?: string[];
}

/** One plugin as the website reads it. */
export interface PublishedPlugin {
  id: string;
  name: string;
  description: string;
  artifact: PluginRecord["artifact"];
  license?: string;
  repository: PluginRecord["repository"];
  categories: string[];
  author: { npm?: string; name?: string; github: string };
  icon?: string;
  screenshots: string[];
  submittedAt: string;
  reviewedAt: string;
  /** When the pinned version was published to npm. */
  publishedAt: string;
  updatedAt: string;
  installs?: number;
}

export interface PublishedPluginDetail extends PublishedPlugin {
  readme: string;
}

export interface PublishedIndex {
  schemaVersion: 1;
  registry: { name: string; url: string };
  generatedAt: string;
  categories: Category[];
  plugins: PublishedPlugin[];
}

function effectiveMedia(record: PluginRecord, listing: ListingFile): ListingFile {
  return {
    icon: record.listing?.icon ?? listing.icon,
    screenshots: record.listing?.screenshots ?? listing.screenshots ?? [],
  };
}

/** Validate what publication will show, using files from the pinned artifact only. */
export async function validateListingMedia(client: NpmClient, record: PluginRecord): Promise<string[]> {
  const check = (media: ListingFile, exists: (path: string) => boolean): string[] => {
    const problems: string[] = [];
    const entries = [
      ...(media.icon !== undefined ? [["icon", media.icon]] : []),
      ...(media.screenshots ?? []).map((value, index) => [`screenshots[${index}]`, value]),
    ];
    for (const [field, value] of entries) {
      const path = mediaPath(value);
      if (path === null) problems.push(`${record.id}: ${field} must be a relative path inside the pinned artifact`);
      else if (!exists(path)) problems.push(`${record.id}: ${field} file "${path}" is missing from the pinned artifact`);
    }
    return problems;
  };
  if (record.artifact.kind === "git") {
    return withGitArtifact(record, (directory) => check(
      effectiveMedia(record, parseListingFile(readOptional(directory, "paseo-listing.json"))),
      (path) => artifactFileExists(directory, path),
    ));
  }
  const artifact = record.artifact;
  const media = effectiveMedia(record, parseListingFile(
    await client.file(artifact.package, artifact.version, "paseo-listing.json"),
  ));
  const paths = [media.icon, ...(media.screenshots ?? [])]
    .filter((value): value is string => value !== undefined)
    .map(mediaPath).filter((value): value is string => value !== null);
  const present = new Set<string>();
  for (const path of new Set(paths)) {
    if (await client.file(artifact.package, artifact.version, path) !== null) present.add(path);
  }
  return check(media, (path) => present.has(path));
}

const CDN = "https://cdn.jsdelivr.net/npm";

export function packageFileUrl(pkg: string, version: string, path: string): string {
  return `${CDN}/${pkg}@${version}/${(mediaPath(path) ?? path).split("/").map(encodeURIComponent).join("/")}`;
}

function assetUrl(pkg: string, version: string, value: string): string {
  return /^https:\/\//.test(value) ? value : packageFileUrl(pkg, version, value);
}

export function parseListingFile(text: string | null): ListingFile {
  if (text === null) return {};
  const raw = JSON.parse(text) as Record<string, unknown>;
  const listing: ListingFile = {};
  if (typeof raw.name === "string") listing.name = raw.name;
  if (typeof raw.icon === "string") listing.icon = raw.icon;
  if (Array.isArray(raw.screenshots))
    listing.screenshots = raw.screenshots.filter((s): s is string => typeof s === "string");
  return listing;
}

export function humanizeId(id: string): string {
  return id
    .split("/")
    .at(-1)!
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Pure merge of the record, the pinned npm version, and the package's listing file. */
export function mergeListing(input: {
  record: PluginRecord;
  doc: VersionDoc;
  publishedAt: string;
  listingFile: ListingFile;
  readme: string | null;
  installs?: number;
}): PublishedPluginDetail {
  const { record, doc, listingFile } = input;
  const author = authorOf(doc);
  const { icon, screenshots = [] } = effectiveMedia(record, listingFile);
  return {
    id: record.id,
    name: record.listing?.name ?? listingFile.name ?? humanizeId(record.id),
    description: doc.description?.trim() ?? "",
    artifact: record.artifact,
    ...(doc.license ? { license: doc.license } : {}),
    repository: record.repository,
    categories: record.categories,
    author: { ...author, github: record.id.split("/")[0] },
    ...(icon ? { icon: assetUrl(doc.name, doc.version, icon) } : {}),
    screenshots: screenshots.map((url) => assetUrl(doc.name, doc.version, url)),
    submittedAt: new Date(record.submittedAt).toISOString(),
    reviewedAt: new Date(record.reviewedAt).toISOString(),
    publishedAt: input.publishedAt,
    updatedAt: new Date(record.reviewedAt).toISOString(),
    ...(input.installs !== undefined ? { installs: input.installs } : {}),
    readme: input.readme ?? "",
  };
}

export async function resolvePlugin(
  client: NpmClient,
  record: PluginRecord,
  overview: string | null = null,
): Promise<PublishedPluginDetail> {
  const readme = requireOverview(await readAuthorOverview(client, record), overview, record.id);
  if (record.artifact.kind === "git") return resolveGitPlugin(record, readme);
  const artifact = record.artifact;
  const packument = await client.packument(artifact.package);
  const doc = resolveVersion(packument, artifact.version);
  if (doc.dist.integrity !== artifact.integrity || doc.dist.tarball !== artifact.resolved) {
    throw new Error(
      `${artifact.package}@${artifact.version} integrity on npm differs from the pinned record`,
    );
  }
  const listingFile = parseListingFile(
    await client.file(doc.name, doc.version, "paseo-listing.json"),
  );
  return mergeListing({
    record,
    doc,
    publishedAt: packument.time[doc.version] ?? packument.time.created,
    listingFile,
    readme,
  });
}

export function summarize(detail: PublishedPluginDetail): PublishedPlugin {
  const { readme: _readme, ...summary } = detail;
  return summary;
}

function resolveGitPlugin(record: PluginRecord, overview: string): PublishedPluginDetail {
  const artifact = record.artifact;
  if (artifact.kind !== "git") throw new Error("Expected git artifact");
  return withGitArtifact(record, (directory) => {
    const manifest = JSON.parse(readOptional(directory, "paseo-plugin.json")!);
    const listing = parseListingFile(readOptional(directory, "paseo-listing.json"));
    const base = `${artifact.remote.replace(/\.git$/, "")}/raw/${artifact.commit}/${artifact.pluginPath ? `${artifact.pluginPath}/` : ""}`;
    const asset = (value: string) => (value.startsWith("https://") ? value : `${base}${(mediaPath(value) ?? value).split("/").map(encodeURIComponent).join("/")}`);
    const { icon, screenshots = [] } = effectiveMedia(record, listing);
    const date = new Date(record.reviewedAt).toISOString();
    return {
      id: record.id,
      name: record.listing?.name ?? listing.name ?? humanizeId(record.id),
      description: manifest.description ?? "",
      artifact,
      repository: record.repository,
      categories: record.categories,
      author: { github: record.id.split("/")[0] },
      ...(icon ? { icon: asset(icon) } : {}),
      screenshots: screenshots.map(asset),
      submittedAt: new Date(record.submittedAt).toISOString(),
      reviewedAt: date,
      updatedAt: date,
      publishedAt: date,
      readme: overview,
    };
  });
}
