import { AuthorError } from "./problems.ts";
import { parseSubmissionSource, type SubmissionSource } from "./submission-source.ts";
import type { Category } from "./categories.ts";

export interface SubmissionIssue {
  source: SubmissionSource;
  categories: string[];
}

/** Parses the body GitHub renders from .github/ISSUE_TEMPLATE/submit-plugin.yml. */
export function parseSubmissionIssue(body: string, categories: Category[]): SubmissionIssue {
  const sections = new Map<string, string>();
  let current: string | null = null;
  for (const line of body.split(/\r?\n/)) {
    const heading = line.match(/^### (.+)$/);
    if (heading) {
      current = heading[1].trim().toLowerCase();
      sections.set(current, "");
      continue;
    }
    if (current) sections.set(current, `${sections.get(current)}${line}\n`);
  }
  const text = (name: string) => {
    const value = sections.get(name)?.trim() ?? "";
    return value === "_No response_" ? "" : value;
  };

  const source = text("source");
  if (!source) throw new AuthorError("The issue has no plugin source. Fill in Source with the public npm package or GitHub repository URL.");

  const labels = new Map(
    categories.map((category) => [category.label.toLowerCase(), category.slug]),
  );
  const checked = [...text("categories").matchAll(/^- \[[xX]\] (.+)$/gm)].map((match) =>
    match[1].trim(),
  );
  const slugs = checked
    .map((label) => labels.get(label.toLowerCase()))
    .filter((slug): slug is string => Boolean(slug));

  try {
    return { source: parseSubmissionSource(source), categories: slugs };
  } catch (error) {
    throw new AuthorError(`The Source field is invalid: ${(error as Error).message} Update Source in the issue.`);
  }
}
