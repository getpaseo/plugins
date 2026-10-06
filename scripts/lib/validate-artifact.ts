import { validateListingMedia } from "./listing.ts";
import { readAuthorOverview, requireOverview, validateOverview } from "./overview.ts";
import { type NpmClient, resolveVersion } from "./npm.ts";
import { parseArtifact, type PluginRecord } from "./record.ts";

/** Check the pinned artifact without running any plugin code. */
export async function validateArtifact(
  client: NpmClient,
  record: PluginRecord,
  context: { previous?: PluginRecord | null; registryOverview?: string | null; allowNewImport?: boolean } = {},
): Promise<string[]> {
  const problems: string[] = [];
  const author = await readAuthorOverview(client, record);
  const previous = context.previous;
  const unchanged = previous &&
    JSON.stringify(parseArtifact(previous.artifact)) === JSON.stringify(parseArtifact(record.artifact)) &&
    previous.repository.commit === record.repository.commit;
  const imported = unchanged || (!previous && context.allowNewImport);
  const registry = validateOverview(context.registryOverview ?? null, `${record.id}.md`);
  requireOverview(author, imported ? registry : null, record.id);
  if (!unchanged) problems.push(...await validateListingMedia(client, record));
  if (record.artifact.kind === "git") return problems;
  const artifact = record.artifact;
  const packument = await client.packument(artifact.package);
  const doc = resolveVersion(packument, artifact.version);
  if (doc.dist.tarball !== artifact.resolved)
    problems.push(`${record.id}: tarball URL differs from pin`);
  if (doc.dist.integrity !== artifact.integrity)
    problems.push(`${record.id}: integrity does not match npm for ${artifact.version}`);
  if ((await client.file(doc.name, doc.version, "paseo-plugin.json")) === null) {
    problems.push(`${record.id}: ${artifact.version} does not ship paseo-plugin.json`);
  }
  if (record.repository?.commit) {
    const provenance = await client.provenance(doc.name, doc.version);
    if (!provenance || provenance.commit !== record.repository.commit) {
      problems.push(`${record.id}: repository.commit is not backed by npm provenance`);
    }
  }
  return problems;
}
