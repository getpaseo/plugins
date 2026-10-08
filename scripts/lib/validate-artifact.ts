import { readArtifactFiles } from "./artifact-files.ts";
import { resolveMetadata } from "./metadata.ts";
import { requireOverview, validateOverview } from "./overview.ts";
import type { NpmClient } from "./npm.ts";
import type { PluginRecord } from "./record.ts";

/** Check the pinned artifact without running any plugin code. */
export async function validateArtifact(
  client: NpmClient,
  record: PluginRecord,
  context: { registryOverview?: string | null; overviewRequired?: boolean } = {},
): Promise<string[]> {
  const problems: string[] = [];
  const files = await readArtifactFiles(client, record.artifact);
  const author = validateOverview(files.overview, `${record.id}/OVERVIEW.md`);
  const registry = validateOverview(context.registryOverview ?? null, `${record.id}.md`);
  // Intake can leave the overview for the reviewer; publication always requires it.
  if (context.overviewRequired !== false) requireOverview(author, registry, record.id);
  resolveMetadata(files, record);
  if (record.artifact.kind === "git") return problems;
  const artifact = record.artifact;
  if (record.repository?.commit) {
    const provenance = await client.provenance(artifact.package, artifact.version);
    if (!provenance || provenance.commit !== record.repository.commit) {
      problems.push(`${record.id}: repository.commit is not backed by npm provenance`);
    }
  }
  return problems;
}
