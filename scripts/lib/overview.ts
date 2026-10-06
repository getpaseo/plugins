import { readOptional, withGitArtifact, withRepositoryCommit } from "./git-artifact.ts";
import { type NpmClient, resolveVersion } from "./npm.ts";
import { parseRepository } from "./repository.ts";
import { type PluginRecord, RECORDS_DIR } from "./record.ts";

/** Registry stopgap for plugins without an author-owned overview. */
export function readOverview(id: string, directory = RECORDS_DIR): string | null {
  const overview = readOptional(directory, `${id}.md`);
  return validateOverview(overview, `${id}.md`);
}

/** Shared content contract for registry and artifact overviews. */
export function validateOverview(overview: string | null, source: string): string | null {
  if (
    overview !== null &&
    /\b(?:paseo\s+plugin\s+add|npm\s+install|npm\s+i(?=\s|$))/i.test(overview)
  ) {
    throw new Error(`${source}: overviews must not contain install commands`);
  }
  return overview;
}

/** The author's OVERVIEW.md as validate resolves it for this record, null when absent. */
export async function readAuthorOverview(client: NpmClient, record: PluginRecord): Promise<string | null> {
  const read = (directory: string) =>
    validateOverview(readOptional(directory, "OVERVIEW.md"), `${record.id}/OVERVIEW.md`);
  if (record.artifact.kind === "git") return withGitArtifact(record, read);
  if (!record.repository.commit) return null;
  const doc = resolveVersion(await client.packument(record.artifact.package), record.artifact.version);
  const source = parseRepository(doc.repository);
  if (!source) throw new Error(`${record.id}: pinned npm version has no source repository`);
  return withRepositoryCommit(source, record.repository.commit, read);
}

/** The existing protocol field contains only an author overview or an import stopgap. */
export function requireOverview(author: string | null, registry: string | null, id: string): string {
  const overview = author ?? registry;
  if (overview === null) throw new Error(`${id}/OVERVIEW.md is required`);
  return overview;
}
