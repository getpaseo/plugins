import { AuthorError } from "./problems.ts";
import { readOptional } from "./git-artifact.ts";
import type { NpmClient } from "./npm.ts";
import { readArtifactFiles } from "./artifact-files.ts";
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
    throw new AuthorError(`${source}: overviews must not contain install commands. Remove the installation commands from OVERVIEW.md and publish a new release.`);
  }
  return overview;
}

/** The author's OVERVIEW.md as validate resolves it for this record, null when absent. */
export async function readAuthorOverview(client: NpmClient, record: PluginRecord): Promise<string | null> {
  const files = await readArtifactFiles(client, record.artifact);
  return validateOverview(files.overview, `${record.id}/OVERVIEW.md`);
}

/** The existing protocol field contains only an author overview or an import stopgap. */
export function requireOverview(author: string | null, registry: string | null, id: string): string {
  const overview = author ?? registry;
  if (overview === null) throw new AuthorError(`${id}/OVERVIEW.md is required. Add OVERVIEW.md beside paseo-plugin.json in the submitted artifact and publish a new release. For npm, include it at the published package root; for GitHub, include it in the plugin directory at the pinned commit.`);
  return overview;
}
