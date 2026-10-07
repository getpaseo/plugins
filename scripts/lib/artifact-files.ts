import { readOptional, withGitArtifact } from "./git-artifact.ts";
import { type NpmClient, resolveVersion } from "./npm.ts";
import type { PluginRecord } from "./record.ts";

export interface ArtifactFiles {
  manifest: string | null;
  overview: string | null;
}

/** Read plugin files from the verified install pin, independently of repository metadata. */
export async function readArtifactFiles(
  client: NpmClient,
  artifact: PluginRecord["artifact"],
): Promise<ArtifactFiles> {
  if (artifact.kind === "git") {
    return withGitArtifact({ artifact }, (directory) => ({
      manifest: readOptional(directory, "paseo-plugin.json"),
      overview: readOptional(directory, "OVERVIEW.md"),
    }));
  }
  const doc = resolveVersion(await client.packument(artifact.package), artifact.version);
  if (doc.dist.integrity !== artifact.integrity || doc.dist.tarball !== artifact.resolved) {
    throw new Error(`${artifact.package}@${artifact.version} integrity on npm differs from the pinned record`);
  }
  const [manifest, overview] = await Promise.all([
    client.file(artifact.package, artifact.version, "paseo-plugin.json"),
    client.file(artifact.package, artifact.version, "OVERVIEW.md"),
  ]);
  return { manifest, overview };
}
