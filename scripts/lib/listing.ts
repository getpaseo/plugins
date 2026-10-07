import { readArtifactFiles } from "./artifact-files.ts";
import { validateOverview, requireOverview } from "./overview.ts";
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
  featured: string[];
  plugins: PublishedPlugin[];
}

export async function resolvePlugin(
  client: NpmClient,
  record: PluginRecord,
  overview: string | null = null,
): Promise<PublishedPluginDetail> {
  const files = await readArtifactFiles(client, record.artifact);
  const readme = requireOverview(validateOverview(files.overview, `${record.id}/OVERVIEW.md`), overview, record.id);
  const metadata = resolveMetadata(files, record);
  const artifact = record.artifact;
  const doc = artifact.kind === "npm"
    ? resolveVersion(await client.packument(artifact.package), artifact.version)
    : undefined;
  const date = new Date(record.reviewedAt).toISOString();
  return {
    id: record.id,
    ...metadata,
    description: doc ? doc.description?.trim() ?? "" : metadata.description,
    artifact,
    ...(doc?.license ? { license: doc.license } : {}),
    repository: record.repository,
    categories: record.categories,
    author: { ...(doc ? authorOf(doc) : {}), github: record.id.split("/")[0] },
    submittedAt: new Date(record.submittedAt).toISOString(),
    reviewedAt: date,
    publishedAt: date,
    updatedAt: date,
    readme,
  };
}

export function summarize(detail: PublishedPluginDetail): PublishedPlugin {
  const { readme: _readme, ...summary } = detail;
  return summary;
}
