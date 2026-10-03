/** Minimal `--flag value` and `--flag` parsing for the scripts. */
export function parseArgs(argv: string[]): { positional: string[]; flags: Map<string, string | true> } {
  const positional: string[] = [];
  const flags = new Map<string, string | true>();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const [name, inline] = arg.slice(2).split("=", 2);
    if (inline !== undefined) {
      flags.set(name, inline);
    } else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) {
      flags.set(name, argv[i + 1]);
      i += 1;
    } else {
      flags.set(name, true);
    }
  }
  return { positional, flags };
}

export function flagString(flags: Map<string, string | true>, name: string): string | undefined {
  const value = flags.get(name);
  return typeof value === "string" ? value : undefined;
}
