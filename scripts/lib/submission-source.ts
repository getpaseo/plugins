import { normalizeRepositoryUrl } from "./repository.ts";

export type SubmissionSource =
  | { kind: "npm"; package: string; version?: string }
  | { kind: "git"; source: string; pluginPath?: string; ref?: string };

/** Preserve submitted revisions; intake does not choose a release. */
export function parseSubmissionSource(input: string): SubmissionSource {
  let reference = input.trim();
  let ref: string | undefined;
  const hash = reference.indexOf("#");
  if (hash !== -1) {
    ref = decodeURIComponent(reference.slice(hash + 1));
    reference = reference.slice(0, hash);
    if (!ref || /[\s\x00-\x1f]/.test(ref) || ref.startsWith("-")) throw new Error("Use a non-empty Git reference.");
  }
  const npmPage = /^https:\/\/(?:www\.)?npmjs\.com\/package\/((?:@[^/]+\/)?[^/]+)(?:\/v\/([^/]+))?\/?$/.exec(reference);
  if (npmPage) reference = `npm:${decodeURIComponent(npmPage[1])}${npmPage[2] ? `@${npmPage[2]}` : ""}`;

  // Read browser paths before URL normalization can erase traversal segments.
  const tree = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/tree\/([^/]+)(?:\/(.*))?$/.exec(reference);
  if (tree) {
    if (ref) throw new Error("Supply one Git reference.");
    ref = decodeURIComponent(tree[2]);
    const path = tree[3] ? decodeURIComponent(tree[3].replace(/\/$/, "")) : undefined;
    if (path && !isPortableRelativePluginPath(path))
      throw new Error("Plugin path must stay inside the repository");
    reference = `https://github.com/${tree[1]}${path ? `:${path}` : ""}`;
  }

  const parsed = parsePluginSourceReference(reference);
  if (
    parsed.kind === "directory" ||
    isRegistryReference(reference) ||
    /^(?:git:)?file:/.test(reference)
  ) {
    throw new Error("Registry ids and host directories are not submissions; paste the repository or package instead.");
  }
  const pkg = parsed.source.replace(/^npm:/, "");
  const npm = /^((?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*)(?:@([^\s/:]+))?$/.exec(pkg);
  if (npm) {
    if (ref) throw new Error("Use @version for an npm package.");
    if (parsed.pluginPath) throw new Error("Submit the npm package containing the plugin at its root.");
    return { kind: "npm", package: npm[1], ...(npm[2] ? { version: npm[2] } : {}) };
  }

  // A path suffix disambiguates the legacy install shorthand from a registry id.
  const source = parsed.pluginPath && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(parsed.source)
    ? `github:${parsed.source}` : parsed.source;
  const remote = normalizeGitSource(source);
  if (/[?#]/.test(remote)) throw new Error("Use a GitHub repository URL, optionally with #ref or /tree/ref.");
  const url = normalizeRepositoryUrl(remote.replace(/\/$/, ""));
  if (!url || !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(url)) {
    throw new Error("Paste a GitHub repository or npm package instead.");
  }
  return {
    kind: "git",
    source: url,
    ...(ref ? { ref } : {}),
    ...(parsed.pluginPath && parsed.pluginPath !== "." ? { pluginPath: parsed.pluginPath } : {}),
  };
}

// Copied from getpaseo/paseo at 05637a7f052630a35f07e1264c95646d414ef33a:
// packages/protocol/src/plugin-source-reference.ts (parser and path validation),
// packages/server/src/server/plugins/managed-source.ts (normalizeGitSource).
// The registry has no protocol dependency. Keep these helpers aligned upstream.
// Registry-reference detection below mirrors plugin-registry.ts without Zod.
interface PluginSourceReference {
  kind: "directory" | "managed";
  source: string;
  pluginPath: string | undefined;
}

function parsePluginSourceReference(reference: string): PluginSourceReference {
  const prefix = /^(npm:|github:|git:(?!\/\/))/.exec(reference)?.[0];
  const source = prefix ? reference.slice(prefix.length) : reference;
  const parsed = splitPluginPath(source, { scp: prefix !== "npm:" });
  if (!prefix && /^(\.\.?(?:[/\\]|$)|\/|~|[A-Za-z]:[/\\]|\\\\)/.test(parsed.source)) {
    return { kind: "directory", ...parsed };
  }
  if (isRegistryReference(reference))
    return { kind: "managed", source: reference, pluginPath: undefined };
  return { kind: "managed", ...parsed, source: `${prefix ?? ""}${parsed.source}` };
}

function splitPluginPath(
  reference: string,
  options: { scp: boolean },
): Pick<PluginSourceReference, "source" | "pluginPath"> {
  const separator = reference.lastIndexOf(":");
  if (separator === -1) return { source: reference, pluginPath: undefined };

  const pluginPath = reference.slice(separator + 1);
  if (!isPortableRelativePluginPath(pluginPath)) {
    return { source: reference, pluginPath: undefined };
  }

  const scheme = reference.indexOf("://");
  if (scheme !== -1) {
    const pathStart = reference.indexOf("/", scheme + 3);
    if (pathStart === -1 || separator < pathStart) {
      return { source: reference, pluginPath: undefined };
    }
  } else if (options.scp) {
    const scpSeparator = reference.match(/^[^/@\s]+@[^:\s]+:/)?.[0].length;
    if (scpSeparator !== undefined && separator === scpSeparator - 1) {
      return { source: reference, pluginPath: undefined };
    }
  }

  return { source: reference.slice(0, separator), pluginPath };
}

function isPortableRelativePluginPath(pluginPath: string): boolean {
  if (pluginPath === ".") return true;
  if (!pluginPath || pluginPath.startsWith("/") || pluginPath.startsWith("\\")) return false;
  if (/^[A-Za-z]:/.test(pluginPath) || pluginPath.includes(":")) return false;
  return pluginPath.split(/[\\/]/).every((part) => part !== "" && part !== "." && part !== "..");
}

/** Only explicit Git prefixes expand GitHub shorthand. */
function normalizeGitSource(source: string): string {
  const expandsShorthand = source.startsWith("github:") || source.startsWith("git:");
  if (source.startsWith("github:")) {
    const shorthand = source.slice(7);
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(shorthand)) {
      throw new Error("Use github:owner/repository for a GitHub plugin source");
    }
    source = shorthand;
  } else if (source.startsWith("git:") && !source.startsWith("git://")) {
    source = source.slice(4);
  }
  const github = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(source);
  if (github && expandsShorthand) {
    const repository = github[2].replace(/\.git$/, "");
    return `https://github.com/${github[1]}/${repository}.git`;
  }
  const isUrl = /^(?:https?|ssh|git|file):\/\//.test(source);
  const isScpStyle = /^[^/@\s]+@[^:\s]+:.+$/.test(source);
  if (isUrl || isScpStyle) return source;
  throw new Error(`Plugin source is neither an existing directory nor a Git URL: ${source}`);
}

function isRegistryReference(source: string): boolean {
  const id = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const segments = source.split("/");
  if (segments.length === 2 && id.test(source)) return true;
  const [host, ...rest] = segments;
  if (segments.length !== 3 || !host || !/[.:]/.test(host) || /[@?#\\]/.test(host)) return false;
  if (!id.test(rest.join("/"))) return false;
  new URL(`https://${host}`);
  return true;
}
