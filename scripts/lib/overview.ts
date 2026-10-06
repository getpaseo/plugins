import { readOptional } from "./git-artifact.ts";
import { RECORDS_DIR } from "./record.ts";

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
