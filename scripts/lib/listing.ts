import { parseMedia } from "./media.ts";
import { readAuthorOverview, requireOverview } from "./overview.ts";
import type { Category } from "./categories.ts";
import { authorOf, type NpmClient, resolveVersion, type VersionDoc } from "./npm.ts";
import { readOptional, withGitArtifact } from "./git-artifact.ts";
import type { PluginRecord } from "./record.ts";

/** What paseo-listing.json in the package may declare. */
export interface ListingFile {
  name?: string;
  icon?: string;
  media?: string[];
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
  media: string[];
  submittedAt: string;
  reviewedAt: string;
  /** Registry publication date, derived from the record review date. */
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
  if (raw.media !== undefined) listing.media = parseMedia(raw.media);
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
  listingFile: ListingFile;
  readme: string | null;
  installs?: number;
}): PublishedPluginDetail {
  const { record, doc, listingFile } = input;
  const author = authorOf(doc);
  const media = record.listing?.media ?? listingFile.media ?? [];
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
    media,
    submittedAt: new Date(record.submittedAt).toISOString(),
    reviewedAt: new Date(record.reviewedAt).toISOString(),
    publishedAt: new Date(record.reviewedAt).toISOString(),
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
      media: record.listing?.media ?? listing.media ?? [],
      submittedAt: new Date(record.submittedAt).toISOString(),
      reviewedAt: date,
      updatedAt: date,
      publishedAt: date,
      readme: overview,
    };
  });
}
