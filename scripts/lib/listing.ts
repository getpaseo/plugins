import type { Category } from "./categories.ts";
import { authorOf, type Downloads, type NpmClient, resolveVersion, type VersionDoc } from "./npm.ts";
import type { PluginRecord } from "./record.ts";
import { browseUrl, githubOwner, parseRepository } from "./repository.ts";

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
  package: string;
  version: string;
  integrity: string;
  license: string | null;
  repository: { url: string; commit?: string } | null;
  categories: string[];
  author: { npm: string; name: string; github: string | null };
  icon: string | null;
  screenshots: string[];
  submittedAt: string;
  reviewedAt: string;
  /** When the pinned version was published to npm. */
  publishedAt: string;
  downloads: Downloads | null;
}

export interface PublishedPluginDetail extends PublishedPlugin {
  readme: string;
}

export interface PublishedIndex {
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
  if (Array.isArray(raw.screenshots)) listing.screenshots = raw.screenshots.filter((s): s is string => typeof s === "string");
  if (typeof raw.readme === "string") listing.readme = raw.readme;
  return listing;
}

export function humanizeId(id: string): string {
  return id.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

/** Pure merge of the record, the pinned npm version, and the package's listing file. */
export function mergeListing(input: {
  record: PluginRecord;
  doc: VersionDoc;
  publishedAt: string;
  listingFile: ListingFile;
  readme: string | null;
  downloads: Downloads | null;
}): PublishedPluginDetail {
  const { record, doc, listingFile } = input;
  const author = authorOf(doc);
  const source = parseRepository(doc.repository);
  const repository = record.repository ?? (source ? { url: browseUrl(source) } : null);
  const screenshots = record.listing?.screenshots ?? listingFile.screenshots ?? [];
  const icon = record.listing?.icon ?? listingFile.icon;
  return {
    id: record.id,
    name: record.listing?.name ?? listingFile.name ?? humanizeId(record.id),
    description: doc.description?.trim() ?? "",
    package: doc.name,
    version: doc.version,
    integrity: doc.dist.integrity,
    license: doc.license ?? null,
    repository,
    categories: record.categories,
    author: { ...author, github: repository ? githubOwner(repository.url) : null },
    icon: icon ? assetUrl(doc.name, doc.version, icon) : null,
    screenshots: screenshots.map((url) => assetUrl(doc.name, doc.version, url)),
    submittedAt: record.submittedAt,
    reviewedAt: record.reviewedAt,
    publishedAt: input.publishedAt,
    downloads: input.downloads,
    readme: input.readme ?? "",
  };
}

export async function resolvePlugin(client: NpmClient, record: PluginRecord): Promise<PublishedPluginDetail> {
  const packument = await client.packument(record.package);
  const doc = resolveVersion(packument, record.version);
  if (doc.dist.integrity !== record.integrity) {
    throw new Error(`${record.package}@${record.version} integrity on npm differs from the pinned record`);
  }
  const listingFile = parseListingFile(await client.file(doc.name, doc.version, "paseo-listing.json"));
  const readmePath = listingFile.readme ?? "README.md";
  const readme = (await client.file(doc.name, doc.version, readmePath)) ?? (await client.file(doc.name, doc.version, "readme.md"));
  let downloads: Downloads | null = null;
  try {
    downloads = await client.downloads(doc.name, packument.time.created.slice(0, 10));
  } catch (error) {
    console.warn(`downloads unavailable for ${doc.name}: ${(error as Error).message}`);
  }
  return mergeListing({
    record,
    doc,
    publishedAt: packument.time[doc.version] ?? packument.time.created,
    listingFile,
    readme,
    downloads,
  });
}

export function summarize(detail: PublishedPluginDetail): PublishedPlugin {
  const { readme: _readme, ...summary } = detail;
  return summary;
}
