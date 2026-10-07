import type { ArtifactFiles } from "./artifact-files.ts";
import { mediaKind } from "./media.ts";
import { AuthorError } from "./problems.ts";
import type { PluginRecord } from "./record.ts";

export interface PluginMetadata {
  name: string;
  description: string;
  icon?: string;
  media: string[];
}

/** Read metadata at the artifact pin and apply the registry's per-field overrides.
 * Categories do not determine a plugin's type or its content requirements.
 */
export function resolveMetadata(files: ArtifactFiles, record: PluginRecord): PluginMetadata {
  const artifact = record.artifact;
  const base = artifact.kind === "git"
    ? `${artifact.remote.replace(/\.git$/, "")}/raw/${artifact.commit}/${artifact.pluginPath ? `${encodePath(artifact.pluginPath)}/` : ""}`
    : `https://cdn.jsdelivr.net/npm/${artifact.package}@${artifact.version}/`;
  return readMetadata(files.manifest, record, base);
}

function readMetadata(text: string | null, record: PluginRecord, base: string): PluginMetadata {
  if (text === null) throw new AuthorError("The package does not contain paseo-plugin.json. Include the manifest and publish a new release.");
  let manifest: Record<string, unknown>;
  try {
    const raw: unknown = JSON.parse(text);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error();
    manifest = raw as Record<string, unknown>;
  } catch {
    throw new AuthorError("paseo-plugin.json must be a JSON object. Fix the manifest and publish a new release.");
  }
  const name = manifest.name;
  if (name !== undefined && (typeof name !== "string" || !name.trim())) invalid("name", "a non-empty string");
  const icon = manifest.icon;
  if (icon !== undefined && (typeof icon !== "string" || !isRelativePath(icon) || !/\.png$/i.test(icon))) {
    invalid("icon", "a relative PNG path inside the package, such as assets/icon.png");
  }
  const media = manifest.media;
  if (media !== undefined) {
    if (!Array.isArray(media)) invalid("media", "an array of image or video paths or HTTPS URLs");
    for (const [index, value] of (media as unknown[]).entries()) {
      if (typeof value !== "string" || !(value.startsWith("https://") ? mediaKind(value) : isRelativePath(value) && mediaKind(`${base}${encodePath(value)}`))) {
        invalid(`media[${index}]`, "an HTTPS image/video URL or a relative path inside the package (png, jpg, jpeg, webp, gif, mp4, webm)");
      }
    }
  }

  const assetUrl = (value: string): string => {
    if (value.startsWith("https://")) return value;
    return `${base}${encodePath(value)}`;
  };
  const selectedIcon = record.listing?.icon ?? (icon as string | undefined);
  const selectedMedia = record.listing?.media ?? (media as string[] | undefined) ?? [];
  return {
    name: record.listing?.name ?? (name as string | undefined) ?? humanizeId(record.id),
    description: typeof manifest.description === "string" ? manifest.description : "",
    ...(selectedIcon !== undefined ? { icon: assetUrl(selectedIcon) } : {}),
    media: selectedMedia.map(assetUrl),
  };
}

function invalid(field: string, expected: string): never {
  throw new AuthorError(`paseo-plugin.json: ${field} must be ${expected}. Fix the field and publish a new release.`);
}

function isRelativePath(value: string): boolean {
  return !/[\\:?#\x00-\x1f\x7f]/.test(value) && value.split("/").every((part) => part !== "" && part !== "." && part !== "..");
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function humanizeId(id: string): string {
  return id.split("/").at(-1)!.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
