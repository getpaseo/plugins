import { readArtifactFiles } from "./artifact-files.ts";
import { requireOverview } from "./overview.ts";
import type { Category } from "./categories.ts";
import { authorOf, type NpmClient, resolveVersion } from "./npm.ts";
import { resolveMetadata } from "./metadata.ts";
import type { PluginRecord } from "./record.ts";

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
  /** When the plugin was first listed. Updates keep it. */
  publishedAt: string;
  /** When the pinned version was approved, the same as reviewedAt. */
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
  featured: string[];
  plugins: PublishedPlugin[];
}

export async function resolvePlugin(
  client: NpmClient,
  record: PluginRecord,
  overview: string | null = null,
): Promise<PublishedPluginDetail> {
  const files = await readArtifactFiles(client, record.artifact);
  const readme = requireOverview(files.overview, overview, record.id);
  const artifact = record.artifact;
  const doc = artifact.kind === "npm"
    ? resolveVersion(await client.packument(artifact.package), artifact.version)
    : undefined;
  const metadata = resolveMetadata(files, record, doc ? doc.description?.trim() ?? "" : undefined);
  const reviewedAt = new Date(record.reviewedAt).toISOString();
  return {
    id: record.id,
    ...metadata,
    artifact,
    ...(doc?.license ? { license: doc.license } : {}),
    repository: record.repository,
    categories: record.categories,
    author: { ...(doc ? authorOf(doc) : {}), github: record.id.split("/")[0] },
    submittedAt: new Date(record.submittedAt).toISOString(),
    reviewedAt,
    publishedAt: new Date(record.publishedAt).toISOString(),
    updatedAt: reviewedAt,
    readme,
  };
}

export function summarize(detail: PublishedPluginDetail): PublishedPlugin {
  const { readme: _readme, ...summary } = detail;
  return summary;
}
