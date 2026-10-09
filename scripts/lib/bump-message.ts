import type { PluginRecord } from "./record.ts";

export function bumpBody(previous: PluginRecord, next: PluginRecord, diff: string, note = "", validation = ""): string {
  if (previous.artifact.kind !== "npm" || next.artifact.kind !== "npm") throw new Error("Automatic bumps are npm-only");
  const label = next.listing?.name ?? next.id;
  const author = next.submittedBy ? `@${next.submittedBy}, ` : "";
  const limit = 60_000;
  return [
    `**${label}: ${previous.artifact.version} → ${next.artifact.version}**`, "",
    `${author}this update is ready for review. The published version stays unchanged until approval.`,
    "", "<details>", "<summary>Artifact and validation details</summary>", "",
    `Package: \`${next.artifact.package}\`.`,
    "", "```json", JSON.stringify({ previous: previous.artifact, proposed: next.artifact }, null, 2), "```",
    "", note.trim(), validation.trim(), "", "</details>", "",
    "<details>", `<summary>Artifact diff${diff.length > limit ? " (truncated)" : ""}</summary>`, "",
    "```diff", diff.slice(0, limit) || "(no file changes)", "```", "", "</details>",
  ].join("\n");
}
