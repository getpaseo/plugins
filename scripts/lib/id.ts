/** Listing id from an npm name: "@omercnet/paseo-dracula" -> "dracula", "paseo-defer" -> "defer". */
export function deriveId(packageName: string): string {
  const [scope, bare] = packageName.startsWith("@")
    ? packageName.slice(1).split("/")
    : [undefined, packageName];
  const stripped = bare
    .replace(/^paseo-plugin-/, "")
    .replace(/^paseo-/, "")
    .replace(/-paseo-plugin$/, "")
    .replace(/-paseo$/, "")
    .replace(/-plugin$/, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "");
  if (stripped && stripped !== "plugin" && stripped !== "paseo") return stripped;
  return (scope ?? bare).replace(/[^a-z0-9-]/g, "-");
}
