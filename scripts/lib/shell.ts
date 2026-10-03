import { execFileSync, type ExecFileSyncOptions } from "node:child_process";

export function run(command: string, args: string[], options: ExecFileSyncOptions = {}): string {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    ...options,
  })
    .toString()
    .trim();
}

export function gh(args: string[], options: ExecFileSyncOptions = {}): string {
  return run("gh", args, options);
}

export function ghJson<T>(args: string[]): T {
  return JSON.parse(gh(args)) as T;
}

export function git(args: string[], options: ExecFileSyncOptions = {}): string {
  return run("git", args, options);
}
