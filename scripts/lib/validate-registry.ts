import { requireCompletedSubmissions } from "./submission.ts";
import { validateArtifact } from "./validate-artifact.ts";
import { categorySlugs, readCategories } from "./categories.ts";
import { readFeatured } from "./featured.ts";
import { createNpmClient, type NpmClient } from "./npm.ts";
import { readOverview } from "./overview.ts";
import { readRecords } from "./record.ts";
import { checkMediaUrls } from "./media.ts";
import { git } from "./shell.ts";

export class RegistryValidationError extends Error {
  readonly problems: Array<{ id: string; error: Error }>;
  constructor(problems: Array<{ id: string; error: Error }>) {
    super(problems.map(({ id, error }) => `${id}: ${error.message}`).join("\n"));
    this.problems = problems;
  }
}

/** The CLI and submission review run the same checks with the same artifact client. */
export async function validateRegistry(options: {
  online?: boolean;
  changedOnly?: boolean;
  overviewPendingFor?: string;
  base?: string;
  client?: NpmClient;
} = {}): Promise<void> {
  const { online = false, changedOnly = false, overviewPendingFor,
    base = "origin/main", client = createNpmClient() } = options;
  requireCompletedSubmissions();
  const known = categorySlugs(readCategories());
  const records = readRecords(known);
  readFeatured(records);
  for (const record of records) readOverview(record.id);
  console.log(`${records.length} record(s) are well-formed`);
  if (!online) return;

  let selected = records;
  if (changedOnly) {
    const baseCommit = git(["merge-base", base, "HEAD"]);
    const changed = new Set(
      git(["diff", "--name-only", `${baseCommit}...HEAD`, "--", "plugins/"])
        .split("\n")
        .filter(Boolean)
        .map((path) => path.replace(/^plugins\//, "").replace(/\.(?:json|md)$/, "")),
    );
    selected = records.filter((record) => changed.has(record.id));
  }

  const mediaProblems = await checkMediaUrls(selected.flatMap((record) => record.listing?.media ?? []));
  for (const record of selected) {
    for (const url of record.listing?.media ?? []) {
      if (mediaProblems.has(url)) console.error(`${record.id}: media ${url}: ${mediaProblems.get(url)}`);
    }
  }
  if (mediaProblems.size) throw new Error("Registry validation failed; see the diagnostics above.");

  const problems: Array<{ id: string; error: Error }> = [];
  for (const record of selected) {
    try {
      for (const message of await validateArtifact(client, record, {
        registryOverview: readOverview(record.id),
        overviewRequired: record.id !== overviewPendingFor,
      })) problems.push({ id: record.id, error: new Error(message) });
    } catch (error) {
      problems.push({ id: record.id, error: error as Error });
    }
  }
  if (problems.length > 0) {
    throw new RegistryValidationError(problems);
  }
  console.log(`${selected.length} record(s) match their pinned artifacts`);
}
