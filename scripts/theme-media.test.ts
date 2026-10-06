import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

test("validation requires an image on every theme record", (t) => {
  const registry = mkdtempSync(join(tmpdir(), "theme-media-test-"));
  t.after(() => rmSync(registry, { recursive: true, force: true }));
  cpSync(fileURLToPath(new URL(".", import.meta.url)), join(registry, "scripts"), { recursive: true });
  cpSync(fileURLToPath(new URL("../categories.json", import.meta.url)), join(registry, "categories.json"));
  writeFileSync(join(registry, "featured.json"), "[]\n");
  mkdirSync(join(registry, "plugins/acme"), { recursive: true });
  const record = {
    id: "acme/example", categories: ["themes", "utils"],
    artifact: { kind: "git", remote: "https://github.com/acme/example.git", commit: "a".repeat(40) },
    repository: { url: "https://github.com/acme/example" },
    submittedAt: "2026-09-12", reviewedAt: "2026-09-12",
  };
  const validate = (value: unknown) => {
    writeFileSync(join(registry, "plugins/acme/example.json"), JSON.stringify(value));
    return spawnSync(process.execPath, ["scripts/validate.ts"], { cwd: registry, encoding: "utf8" });
  };
  for (const listing of [undefined, { media: [] }, { media: ["https://example.test/demo.mp4"] }]) {
    const result = validate({ ...record, listing });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /acme\/example: themes require at least one image/);
  }
  assert.equal(validate({ ...record, listing: { media: ["https://example.test/demo.webm", "https://example.test/screen.PNG?size=2"] } }).status, 0);
  assert.equal(validate({ ...record, categories: ["utils"] }).status, 0);
});
