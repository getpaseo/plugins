import { categorySlugs, readCategories } from "./categories.ts";
import { readFeatured } from "./featured.ts";
import { readOverview, readOverviewTranslations } from "./overview.ts";
import { readRecords, RECORDS_DIR } from "./record.ts";
import { requireCompletedSubmissions } from "./submission.ts";

/** Load registry-owned content, isolating plugin failures during registry-wide runs. */
export function readRegistry(strict: boolean) {
  const problems: Array<{ id: string; error: Error }> = [];
  const reject = (id: string, error: Error) => {
    if (strict) throw error;
    problems.push({ id, error });
  };
  // Submission proposals are not installable records. Review must complete them;
  // their presence must not prevent existing plugins from being published.
  try { requireCompletedSubmissions(); }
  catch (error) {
    if (strict) throw error;
    console.warn(`${process.env.GITHUB_ACTIONS ? "::warning::" : ""}${(error as Error).message}`);
  }
  const categories = readCategories();
  const records = readRecords(categorySlugs(categories), RECORDS_DIR, strict ? undefined : reject);
  // Featured IDs can name records rejected above. Keep validating the shared
  // configuration, then filter failed plugins from the published featured list.
  const featured = readFeatured([...records, ...problems.map(({ id }) => ({ id }))]);
  const readable = records.filter((record) => {
    try { readOverview(record.id); readOverviewTranslations(record.id); return true; }
    catch (error) { reject(record.id, error as Error); return false; }
  });
  return { categories, records: readable, featured, problems };
}
