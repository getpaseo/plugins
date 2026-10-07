import { readArtifactFiles } from "./artifact-files.ts";
import { resolveMetadata } from "./metadata.ts";
import { requireOverview, validateOverview } from "./overview.ts";
import type { NpmClient } from "./npm.ts";
import { parseArtifact, type PluginRecord } from "./record.ts";

/** Check the pinned artifact without running any plugin code. */
export async function validateArtifact(
  client: NpmClient,
  record: PluginRecord,
  context: { previous?: PluginRecord | null; registryOverview?: string | null; allowNewImport?: boolean } = {},
): Promise<string[]> {
  const problems: string[] = [];
  const files = await readArtifactFiles(client, record.artifact);
  const author = validateOverview(files.overview, `${record.id}/OVERVIEW.md`);
  const previous = context.previous;
  const unchanged = previous &&
    JSON.stringify(parseArtifact(previous.artifact)) === JSON.stringify(parseArtifact(record.artifact)) &&
    previous.repository.commit === record.repository.commit;
  const imported = unchanged || (!previous && context.allowNewImport);
  const registry = validateOverview(context.registryOverview ?? null, `${record.id}.md`);
  requireOverview(author, imported ? registry : null, record.id);
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
