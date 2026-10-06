import { readOptional } from "./git-artifact.ts";
import { RECORDS_DIR } from "./record.ts";

/** Registry-maintained copy for the existing detail document's readme field. */
export function readOverview(id: string, directory = RECORDS_DIR): string | null {
  const overview = readOptional(directory, `${id}.md`);
  if (
    overview !== null &&
    /\b(?:paseo\s+plugin\s+add|npm\s+install|npm\s+i(?=\s|$))/i.test(overview)
  ) {
    throw new Error(`${id}.md: curated overviews must not contain install commands`);
  }
  return overview;
}
