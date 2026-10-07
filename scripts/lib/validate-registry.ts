import { validateArtifact } from "./validate-artifact.ts";
import { categorySlugs, readCategories } from "./categories.ts";
import { readFeatured } from "./featured.ts";
import { createNpmClient, type NpmClient } from "./npm.ts";
import { readOverview } from "./overview.ts";
import { readRecords } from "./record.ts";
import { checkMediaUrls, mediaKind } from "./media.ts";
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
  allowNewImport?: boolean;
  base?: string;
  client?: NpmClient;
} = {}): Promise<void> {
  const { online = false, changedOnly = false, allowNewImport = false,
    base = "origin/main", client = createNpmClient() } = options;
  const known = categorySlugs(readCategories());
  const records = readRecords(known);
  readFeatured(records);
  const themesWithoutImages = records.filter((record) =>
    record.categories.includes("themes") && !record.listing?.media?.some((url) => mediaKind(url) === "image"),
  );
  if (themesWithoutImages.length) {
    throw new Error(themesWithoutImages.map((record) => `${record.id}: themes require at least one image. A maintainer must supply record media; the submission form does not collect images.`).join("\n"));
  }
  for (const record of records) readOverview(record.id);
  console.log(`${records.length} record(s) are well-formed`);
  if (!online) return;

  // Compare pins to the branch base, rather than treating any edited record as a bump.
  const baseCommit = git(["merge-base", base, "HEAD"]);
  const baseFiles = new Set(git(["ls-tree", "-r", "--name-only", baseCommit, "--", "plugins/"]).split("\n"));
  let selected = records;
  if (changedOnly) {
    const changed = new Set(
      git(["diff", "--name-only", `${baseCommit}...HEAD`, "--", "plugins/"])
        .split("\n")
        .filter(Boolean)
        .map((path) => path.replace(/^plugins\//, "").replace(/\.(?:json|md)$/, "")),
    );
    selected = records.filter((record) => changed.has(record.id));
  }

  const mediaProblems = await checkMediaUrls(records.flatMap((record) => record.listing?.media ?? []));
  for (const record of records) {
    for (const url of record.listing?.media ?? []) {
      if (mediaProblems.has(url)) console.error(`${record.id}: media ${url}: ${mediaProblems.get(url)}`);
    }
  }
  if (mediaProblems.size) throw new Error("Registry validation failed; see the diagnostics above.");

  const problems: Array<{ id: string; error: Error }> = [];
  for (const record of selected) {
    try {
      const path = `plugins/${record.id}.json`;
      // Historical records use their original schema; validateArtifact compares only their pins.
      const previous = baseFiles.has(path)
        ? JSON.parse(git(["show", `${baseCommit}:${path}`]))
        : null;
      for (const message of await validateArtifact(client, record, {
        previous,
        registryOverview: readOverview(record.id),
        allowNewImport,
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
