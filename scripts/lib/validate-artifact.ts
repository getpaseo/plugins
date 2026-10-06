import { validateOverview } from "./overview.ts";
import { readOptional, withGitArtifact } from "./git-artifact.ts";
import { type NpmClient, resolveVersion } from "./npm.ts";
import type { PluginRecord } from "./record.ts";

/** Check the pinned artifact without running any plugin code. */
export async function validateArtifact(client: NpmClient, record: PluginRecord): Promise<string[]> {
  const problems: string[] = [];
  if (record.artifact.kind === "git") {
    withGitArtifact(record, (directory) => {
      validateOverview(readOptional(directory, "OVERVIEW.md"), `${record.id}/OVERVIEW.md`);
    });
    return problems;
  }
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
  validateOverview(
    await client.file(doc.name, doc.version, "OVERVIEW.md"),
    `${record.id}/OVERVIEW.md`,
  );
  if (record.repository?.commit) {
    const provenance = await client.provenance(doc.name, doc.version);
    if (!provenance || provenance.commit !== record.repository.commit) {
      problems.push(`${record.id}: repository.commit is not backed by npm provenance`);
    }
  }
  return problems;
}
