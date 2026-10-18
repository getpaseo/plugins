import { AuthorError } from "./problems.ts";
import { readOptional } from "./git-artifact.ts";
import type { NpmClient } from "./npm.ts";
import { readArtifactFiles } from "./artifact-files.ts";
import { type PluginRecord, RECORDS_DIR } from "./record.ts";

/** Registry overview used when the artifact has no author-owned overview. */
export function readOverview(id: string, directory = RECORDS_DIR): string | null {
  return readOptional(directory, `${id}.md`);
}

/** The author's OVERVIEW.md as validate resolves it for this record, null when absent. */
export async function readAuthorOverview(client: NpmClient, record: PluginRecord): Promise<string | null> {
  const files = await readArtifactFiles(client, record.artifact);
  return files.overview;
}

/** Author content takes precedence over the registry fallback. */
export function requireOverview(author: string | null, registry: string | null, id: string): string {
  const overview = author ?? registry;
  if (overview === null) throw new AuthorError(`${id}: an overview is required before publication. The reviewer can write plugins/${id}.md when the artifact has no OVERVIEW.md.`);
  return overview;
}
