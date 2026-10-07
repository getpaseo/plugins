// Checks every record offline, and with --online checks pinned versions against their artifacts.
//   node scripts/validate.ts [--online] [--changed] [--base <ref>] [--allow-imports]
// --allow-imports permits approved new imports with registry stopgaps, never changed pins.
import { flagString, parseArgs } from "./lib/args.ts";
import { validateRegistry } from "./lib/validate-registry.ts";

const { flags } = parseArgs(process.argv.slice(2));
try {
  await validateRegistry({
    online: flags.has("online"),
    changedOnly: flags.has("changed"),
    allowNewImport: flags.has("allow-imports"),
    base: flagString(flags, "base"),
  });
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
