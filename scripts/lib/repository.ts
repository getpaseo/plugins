import type { VersionDoc } from "./npm.ts";

export interface RepositorySource {
  url: string;
  directory?: string;
}

/** Normalizes the package.json repository field to an https URL plus optional directory. */
export function parseRepository(repository: VersionDoc["repository"]): RepositorySource | null {
  const raw = typeof repository === "string" ? repository : repository?.url;
  if (!raw) return null;
  const directory =
    typeof repository === "object" && repository.directory
      ? repository.directory.replace(/^\/+|\/+$/g, "")
      : undefined;
  const url = normalizeRepositoryUrl(raw);
  if (!url) return null;
  return directory ? { url, directory } : { url };
}

export function normalizeRepositoryUrl(raw: string): string | null {
  let value = raw.trim().replace(/^git\+/, "");
  const shorthand = value.match(/^(?:(github|gitlab|bitbucket):)?([\w.-]+)\/([\w.-]+)$/);
  if (shorthand) {
    const host = `${shorthand[1] ?? "github"}.${shorthand[1] === "bitbucket" ? "org" : "com"}`;
    value = `https://${host}/${shorthand[2]}/${shorthand[3]}`;
  }
  const scp = value.match(/^(?:[\w.-]+@)?([\w.-]+):([\w./-]+)$/);
  if (scp && !value.includes("://")) value = `https://${scp[1]}/${scp[2]}`;
  value = value.replace(/^(ssh|git):\/\/(?:[\w.-]+@)?/, "https://").replace(/^http:\/\//, "https://");
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  parsed.username = "";
  parsed.password = "";
  parsed.hash = "";
  parsed.search = "";
  const pathname = parsed.pathname.replace(/\.git$/, "").replace(/\/+$/, "");
  if (pathname.split("/").filter(Boolean).length < 2) return null;
  return `https://${parsed.host}${pathname}`;
}

/** A link a person can open: the repository root or the plugin's directory inside it. */
export function browseUrl(source: RepositorySource, commit?: string): string {
  const ref = commit ?? "HEAD";
  const host = new URL(source.url).host;
  if (!source.directory && !commit) return source.url;
  const path = source.directory ?? "";
  if (host === "github.com") return `${source.url}/tree/${ref}/${path}`.replace(/\/$/, "");
  if (host === "gitlab.com") return `${source.url}/-/tree/${ref}/${path}`.replace(/\/$/, "");
  if (host === "codeberg.org") return `${source.url}/src/commit/${ref}/${path}`.replace(/\/$/, "");
  return source.url;
}

export function githubOwner(url: string): string | null {
  const match = url.match(/^https:\/\/github\.com\/([\w.-]+)\//);
  return match ? match[1] : null;
}
