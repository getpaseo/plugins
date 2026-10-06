import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { NpmClient } from "./npm.ts";
import { mediaPath, type PluginArtifact } from "./record.ts";

interface ArtifactFiles {
  contains(path: string): boolean;
  text(path: string): string | null;
}

/** Inspect regular package files in the integrity-pinned archive, without extracting or executing it. */
export async function withNpmArtifact<T>(
  client: NpmClient,
  artifact: Extract<PluginArtifact, { kind: "npm" }>,
  consume: (files: ArtifactFiles) => T,
): Promise<T> {
  const directory = mkdtempSync(join(tmpdir(), "paseo-npm-artifact-"));
  const archive = join(directory, "artifact.tgz");
  try {
    await client.tarball(artifact.resolved, archive);
    const integrity = "sha512-" + createHash("sha512").update(readFileSync(archive)).digest("base64");
    if (integrity !== artifact.integrity) throw new Error(`${artifact.package}@${artifact.version}: tarball integrity differs from pin`);
    const tar = (args: string[]) => execFileSync("tar", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    const names = tar(["-tzf", archive]).trimEnd().split("\n");
    const details = tar(["-tvzf", archive]).trimEnd().split("\n");
    if (names.length !== details.length || new Set(names).size !== names.length)
      throw new Error("Ambiguous npm archive entries");
    const regular = new Set(names.filter((name, index) => details[index].startsWith("-")));
    const entry = (path: string) => {
      const normalized = mediaPath(path);
      if (normalized === null) throw new Error("File path escapes npm artifact");
      return `package/${normalized}`;
    };
    return consume({
      contains: (path) => regular.has(entry(path)),
      text(path) {
        const name = entry(path);
        if (!names.includes(name)) return null;
        if (!regular.has(name)) throw new Error(`${path} must be a regular file inside the npm artifact`);
        return tar(["-xOzf", archive, "--", name]);
      },
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
