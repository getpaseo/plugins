import { mkdtempSync, readFileSync, existsSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, relative } from "node:path";
import { run } from "./shell.ts";
import type { PluginRecord } from "./record.ts";
import { parseArtifact } from "./record.ts";
import { isoDate } from "./dates.ts";

export function withGitArtifact<T>(record: PluginRecord, consume: (directory: string) => T): T {
  const artifact = record.artifact;
  if (artifact.kind !== "git") throw new Error("Expected git artifact");
  const directory = mkdtempSync(join(tmpdir(), "paseo-registry-"));
  try {
    run("git", ["clone", "--quiet", "--no-checkout", "--", artifact.remote, directory]);
    const commit = run("git", ["rev-parse", `refs/tags/${artifact.tag}^{commit}`], {
      cwd: directory,
    }).trim();
    if (commit !== artifact.commit)
      throw new Error(`${record.id}: tag no longer matches reviewed commit`);
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

export function latestTag(remote: string): { tag: string; commit: string } {
  const output = run("git", ["ls-remote", "--tags", "--sort=-version:refname", "--", remote]);
  const lines = output.trim().split("\n").filter(Boolean);
  const first = lines[0]?.split("\t");
  if (!first) throw new Error("Repository needs a release tag; HEAD is never approved implicitly");
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
}): PluginRecord {
  const remote = input.source.replace(/\/$/, "").replace(/\.git$/, "");
  const match = /^https:\/\/github\.com\/([a-zA-Z0-9-]+)\/([\w.-]+)$/.exec(remote);
  if (!match) throw new Error("Use a GitHub repository URL");
  const pin = latestTag(remote);
  const artifact = parseArtifact({
    kind: "git",
    remote: `${remote}.git`,
    ...pin,
    pluginPath: input.pluginPath,
  });
  const record: PluginRecord = {
    id: `${match[1].toLowerCase()}/${input.slug ?? match[2].toLowerCase().replace(/^paseo-/, "")}`,
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
