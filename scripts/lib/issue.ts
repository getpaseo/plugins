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
    const heading = line.match(/^(?:###\s+(.+)|([A-Za-z ]+):)\s*$/);
    if (heading) {
      current = (heading[1] ?? heading[2]).trim().toLowerCase();
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
    return { source: normalizeIssueSource(source), categories: slugs };
  } catch (error) {
    throw new AuthorError(`The Source field is invalid: ${(error as Error).message} Update Source in the issue.`);
  }
}

/** A Source field is the intake boundary, even when its value needs correction. */
export function isSubmissionIssue(body: string): boolean {
  return /^(?:###\s+Source\s*|Source:)\s*$/im.test(body);
}

function normalizeIssueSource(text: string): SubmissionSource {
  // Keep the install expression on the first line; subsequent prose describes it.
  const token = text.match(/^\s*`?([^\s`]+)`?/)?.[1];
  if (!token) throw new Error("Supply a plugin source.");
  const source = parseSubmissionSource(token);
  if (source.kind !== "git") return source;
  const commits = [...text.matchAll(/\bcommit\s*:?\s*`?([a-f0-9]{7,40})\b/gi)].map(m => m[1]);
  const standalone = [...text.matchAll(/^\s*`([a-f0-9]{7,40})`\s*$/gm)].map(m => m[1]);
  const refs = [...text.matchAll(/\b(?:ref|reference)\s*:\s*`?([^\s`,)]+)/gi)].map(m => m[1]);
  const explicit = [...new Set([...commits, ...standalone])];
  if (explicit.length > 1) throw new Error("Supply one commit; the Source field names conflicting commits.");
  if (explicit[0]) {
    // A concrete commit is more precise than its accompanying tag or branch.
    if (source.ref && /^[a-f0-9]{7,40}$/i.test(source.ref) && source.ref !== explicit[0])
      throw new Error("The source URL and commit name different revisions.");
    return { ...source, ref: explicit[0] };
  }
  const uniqueRefs = [...new Set([...(source.ref ? [source.ref] : []), ...refs])];
  if (uniqueRefs.length > 1) throw new Error("Supply one Git reference.");
  return uniqueRefs[0] ? parseSubmissionSource(`${token}${source.ref ? "" : `#${uniqueRefs[0]}`}`) : source;
}
