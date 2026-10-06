import { mkdtempSync, readFileSync, existsSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, relative } from "node:path";
import { run } from "./shell.ts";
import type { PluginRecord } from "./record.ts";
import { parseArtifact } from "./record.ts";
import { deriveId } from "./id.ts";
import type { RepositorySource } from "./repository.ts";
import { parseSubmissionSource } from "./submission-source.ts";
import { isoDate } from "./dates.ts";

export function withGitArtifact<T>(record: PluginRecord, consume: (directory: string) => T): T {
  const artifact = record.artifact;
  if (artifact.kind !== "git") throw new Error("Expected git artifact");
  return withCheckout(artifact, consume);
}

/** Read a source repository at an exact reviewed commit, without running its code. */
export function withRepositoryCommit<T>(
  source: RepositorySource,
  commit: string,
  consume: (directory: string) => T,
): T {
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error("Expected a full repository commit");
  return withCheckout({ remote: source.url, commit, pluginPath: source.directory }, consume);
}

function withCheckout<T>(
  artifact: { remote: string; commit: string; pluginPath?: string; tag?: string },
  consume: (directory: string) => T,
): T {
  const directory = mkdtempSync(join(tmpdir(), "paseo-registry-"));
  try {
    run("git", [
      "clone",
      "--quiet",
      "--no-checkout",
      "--no-recurse-submodules",
      "--",
      artifact.remote,
      directory,
    ]);
    if (run("git", ["cat-file", "-t", artifact.commit], { cwd: directory }) !== "commit")
      throw new Error("Pin must name a Git commit");
    const reachable = run("git", [
      "for-each-ref", `--contains=${artifact.commit}`, "--format=%(refname)",
      "refs/remotes", "refs/tags",
    ], { cwd: directory });
    if (!reachable) throw new Error("Pinned commit is not reachable on the declared remote");
    if (artifact.tag) {
      const commit = run("git", ["rev-parse", `refs/tags/${artifact.tag}^{commit}`], {
        cwd: directory,
      }).trim();
      if (commit !== artifact.commit) throw new Error("tag no longer matches reviewed commit");
    }
    run("git", ["checkout", "--quiet", "--detach", artifact.commit], { cwd: directory });
    const plugin = realpathSync(resolve(directory, artifact.pluginPath ?? "."));
    if (relative(directory, plugin).startsWith(".."))
      throw new Error("plugin path escapes checkout");
    JSON.parse(readFileSync(join(plugin, "paseo-plugin.json"), "utf8"));
    return consume(plugin);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

export function latestTag(remote: string): { tag: string; commit: string } | null {
  const output = run("git", ["ls-remote", "--tags", "--sort=-version:refname", "--", remote]);
  const lines = output.trim().split("\n").filter(Boolean);
  const first = lines[0]?.split("\t");
  if (!first) return null;
  const tag = first[1].replace(/^refs\/tags\//, "").replace(/\^\{\}$/, "");
  const peeled = lines.find((line) => line.endsWith(`\trefs/tags/${tag}^{}`));
  return { tag, commit: peeled ? peeled.split("\t")[0] : first[0] };
}

export function pinGit(input: {
  source: string;
  slug?: string;
  pluginPath?: string;
  categories: string[];
  submittedBy?: string;
  commit?: string;
}): PluginRecord {
  const source = parseSubmissionSource(input.source);
  if (source.kind !== "git") throw new Error("Use a GitHub repository source");
  if (source.pluginPath && input.pluginPath && source.pluginPath !== input.pluginPath)
    throw new Error("Conflicting plugin paths");
  const pluginPath = source.pluginPath ?? input.pluginPath;
  const remote = source.source;
  const match = /^https:\/\/github\.com\/([a-zA-Z0-9-]+)\/([\w.-]+)$/.exec(remote);
  if (!match) throw new Error("Use a GitHub repository URL");
  const owner = match[1].toLowerCase();
  if (input.slug?.includes("/") && !input.slug.startsWith(`${owner}/`))
    throw new Error("ID owner must match repository owner");
  const slug =
    input.slug?.split("/").at(-1) ??
    deriveId(pluginPath?.split("/").at(-1) ?? match[2].toLowerCase());
  const pin = input.commit !== undefined
    ? { commit: input.commit }
    : latestTag(`${remote}.git`);
  if (!pin) throw new Error("Repository needs a release tag or an explicit --commit pin; HEAD is never approved implicitly");
  const artifact = parseArtifact({
    kind: "git",
    remote: `${remote}.git`,
    ...pin,
    pluginPath,
  });
  const record: PluginRecord = {
    id: `${owner}/${slug}`,
    artifact,
    repository: { url: remote, commit: pin.commit },
    categories: input.categories,
    submittedAt: isoDate(),
    reviewedAt: isoDate(),
    ...(input.submittedBy ? { submittedBy: input.submittedBy } : {}),
  };
  withGitArtifact(record, () => undefined);
  return record;
}

export function readOptional(directory: string, name: string): string | null {
  const file = resolve(directory, name);
  if (relative(directory, file).startsWith(".."))
    throw new Error("Listing file escapes plugin directory");
  if (!existsSync(file)) return null;
  if (relative(realpathSync(directory), realpathSync(file)).startsWith(".."))
    throw new Error("Listing file escapes plugin directory");
  return readFileSync(file, "utf8");
}
