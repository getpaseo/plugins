import { execFileSync } from "node:child_process";
import { AuthorError } from "./problems.ts";

/** Read bytes to stdout only: never extract package paths or links onto the host. */
export function readPackageFile(archive: Buffer, path: string): string | null {
  if (!path || path.split(/[\\/]/).some((part) => !part || part === "." || part === "..") || /[\x00-\x1f\x7f]/.test(path)) {
    throw new Error("Package file path must be relative and stay inside the package");
  }
  const tar = (args: string[]) => execFileSync("tar", args, {
    input: archive, encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, LC_ALL: "C" },
  });
  const paths = tar(["-tzf", "-"]).split("\n");
  const matches = paths.filter((name) => name === `package/${path}` || name === `./package/${path}`);
  if (matches.length === 0) return null;
  if (matches.length !== 1) throw new AuthorError(`The published package contains multiple copies of ${path}. Publish a package with one regular file at that path.`);
  const entry = matches[0];
  const listing = tar(["-tvzf", "-", "--", entry]).trimEnd().split("\n");
  if (listing.length !== 1 || !listing[0].startsWith("-")) {
    throw new AuthorError(`${path} must be a regular file in the published package. Replace the link with the file itself and publish a new version.`);
  }
  return tar(["-xOzf", "-", "--", entry]);
}
