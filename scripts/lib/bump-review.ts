import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NpmClient } from "./npm.ts";
import { readAuthorOverview } from "./overview.ts";
import { type PluginRecord, recordPath, writeRecord } from "./record.ts";
import { git } from "./shell.ts";

/** Commit the next pin and its overview handoff, then collect review validation. */
export async function commitBumpForReview(input: {
  client: NpmClient;
  next: PluginRecord;
  version: string;
  validate: () => string | Promise<string>;
  registryRoot?: string;
}): Promise<{ note: string; validation: string }> {
  const { client, next, version, validate } = input;
  const cwd = input.registryRoot ?? process.cwd();
  const directory = join(cwd, "plugins");
  const overviewPath = join(directory, `${next.id}.md`);
  const options = { cwd };
  // Invalid content and source failures stop before the branch or records change.
  const author = await readAuthorOverview(client, next);
  git(["checkout", "-B", `bump/${next.id}-${version}`, "origin/main"], options);
  writeRecord(next, directory);
  git(["add", recordPath(next.id, directory)], options);
  const drop = author !== null && existsSync(overviewPath);
  const note = author === null
    ? existsSync(overviewPath)
      ? "This version has no OVERVIEW.md. The registry overview is retained for review and publication.\n\n"
      : "This version has no overview. The reviewer can write the registry overview before publication.\n\n"
    : drop
      ? "This version ships OVERVIEW.md, so the registry's copy is removed in this bump.\n\n"
      : "";
  if (drop) git(["rm", "--quiet", overviewPath], options);
  git(["commit", "-m", `Bump ${next.id} to ${version}`], options);
  let validation: string;
  try {
    validation = await validate();
  } catch {
    // Command errors can include local paths or credentials; details stay in the log.
    validation = "Inline validation failed. See the Bump workflow log.";
  }
  return { note, validation };
}
