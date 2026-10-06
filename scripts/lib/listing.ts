import type { Category } from "./categories.ts";
import { authorOf, type NpmClient, resolveVersion, type VersionDoc } from "./npm.ts";
import { readOptional, withGitArtifact } from "./git-artifact.ts";
import type { PluginRecord } from "./record.ts";

/** What paseo-listing.json in the package may declare. */
export interface ListingFile {
  name?: string;
  icon?: string;
  screenshots?: string[];
  readme?: string;
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

const CDN = "https://cdn.jsdelivr.net/npm";

export function packageFileUrl(pkg: string, version: string, path: string): string {
  return `${CDN}/${pkg}@${version}/${path.replace(/^\.?\//, "")}`;
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
  if (typeof raw.readme === "string") listing.readme = raw.readme;
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
  const screenshots = record.listing?.screenshots ?? listingFile.screenshots ?? [];
  const icon = record.listing?.icon ?? listingFile.icon;
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
  if (record.artifact.kind === "git") return resolveGitPlugin(record, overview);
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
  const readmePath = listingFile.readme ?? "README.md";
  const readme =
    overview ??
    (await client.file(doc.name, doc.version, readmePath)) ??
    (readmePath !== "README.md" ? await client.file(doc.name, doc.version, "README.md") : null) ??
    (await client.file(doc.name, doc.version, "readme.md"));
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

function resolveGitPlugin(record: PluginRecord, overview: string | null): PublishedPluginDetail {
  const artifact = record.artifact;
  if (artifact.kind !== "git") throw new Error("Expected git artifact");
  return withGitArtifact(record, (directory) => {
    const manifest = JSON.parse(readOptional(directory, "paseo-plugin.json")!);
    const listing = parseListingFile(readOptional(directory, "paseo-listing.json"));
    const base = `${artifact.remote.replace(/\.git$/, "")}/raw/${artifact.commit}/${artifact.pluginPath ? `${artifact.pluginPath}/` : ""}`;
    const asset = (value: string) => (value.startsWith("https://") ? value : `${base}${value}`);
    const icon = record.listing?.icon ?? listing.icon;
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
      screenshots: (record.listing?.screenshots ?? listing.screenshots ?? []).map(asset),
      submittedAt: new Date(record.submittedAt).toISOString(),
      reviewedAt: date,
      updatedAt: date,
      publishedAt: date,
      readme:
        overview ??
        readOptional(directory, listing.readme ?? "README.md") ??
        readOptional(directory, "README.md") ??
        readOptional(directory, "readme.md") ??
        "",
    };
  });
}
