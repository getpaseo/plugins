import { parseGitSource } from "./git-artifact.ts";
import type { Category } from "./categories.ts";

export interface SubmissionIssue {
  package: string;
  categories: string[];
  id?: string;
  pluginPath?: string;
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

  const pkg = (text("plugin source") || text("npm package")).replace(/^npm:/, "");
  if (!pkg) throw new Error("the issue has no plugin source");

  const labels = new Map(
    categories.map((category) => [category.label.toLowerCase(), category.slug]),
  );
  const checked = [...text("categories").matchAll(/^- \[[xX]\] (.+)$/gm)].map((match) =>
    match[1].trim(),
  );
  const slugs = checked
    .map((label) => labels.get(label.toLowerCase()))
    .filter((slug): slug is string => Boolean(slug));
  if (slugs.length === 0) throw new Error("the issue has no category ticked");

  const id = text("listing id");
  const git = parseGitSource(pkg, text("plugin path") || undefined);
  return {
    package: git?.source ?? pkg,
    categories: slugs,
    ...(id ? { id } : {}),
    ...(git?.pluginPath ? { pluginPath: git.pluginPath } : {}),
  };
}
