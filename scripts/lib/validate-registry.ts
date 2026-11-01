import { readRegistry } from "./registry.ts";
import { validateArtifact } from "./validate-artifact.ts";
import { createNpmClient, type NpmClient } from "./npm.ts";
import { readOverview } from "./overview.ts";
import { recordDateProblems } from "./record.ts";
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
  const { records, problems } = readRegistry(changedOnly || !online);
  console.log(`${records.length} record(s) are well-formed`);
  if (!online) return;

  let selected = records;
  if (changedOnly) {
    const baseCommit = git(["merge-base", base, "HEAD"]);
    const changed = new Set(
      git(["diff", "--name-only", `${baseCommit}...HEAD`, "--", "plugins/"])
        .split("\n")
        .filter(Boolean)
        .map((path) => path.replace(/^plugins\//, "").replace(/\.(?:json|md)$/, "").replace(/\.[^.]+$/, "")),
    );
    selected = records.filter((record) => changed.has(record.id));
    const dateProblems = selected.flatMap((record) =>
      recordDateProblems(record, listedRecord(baseCommit, record.id))
        .map((message) => ({ id: record.id, error: new Error(message) })));
    if (dateProblems.length) throw new RegistryValidationError(dateProblems);
  }

  const mediaProblems = await checkMediaUrls(selected.flatMap((record) => record.listing?.media ?? []));
  const malformed = problems.length;
  for (const record of selected) {
    const mediaErrors = (record.listing?.media ?? []).filter((url) => mediaProblems.has(url));
    if (mediaErrors.length) {
      for (const url of mediaErrors) {
        problems.push({ id: record.id, error: new Error(`media ${url}: ${mediaProblems.get(url)}`) });
      }
      continue;
    }
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
    // A review rejects its proposed records; a registry-wide run isolates plugin failures.
    if (changedOnly) throw new RegistryValidationError(problems);
    for (const { id, error } of problems) {
      console.warn(`${process.env.GITHUB_ACTIONS ? "::warning::" : ""}Skipped ${id}: ${error.message}`);
    }
  }
  const skipped = new Set(problems.map(({ id }) => id)).size;
  console.log(`${selected.length + malformed - skipped} record(s) match their pinned artifacts, ${skipped} skipped`);
}

/** The record as listed at the base commit, or undefined when it is new. */
function listedRecord(commit: string, id: string): Record<string, unknown> | undefined {
  const path = `plugins/${id}.json`;
  if (!git(["ls-tree", "--name-only", commit, "--", path])) return undefined;
  return JSON.parse(git(["show", `${commit}:${path}`]));
}
