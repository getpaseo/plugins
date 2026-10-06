import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

test("validation rejects unknown or duplicate featured IDs and malformed lists", (t) => {
  const registry = mkdtempSync(join(tmpdir(), "featured-test-"));
  t.after(() => rmSync(registry, { recursive: true, force: true }));
  cpSync(fileURLToPath(new URL(".", import.meta.url)), join(registry, "scripts"), { recursive: true });
  cpSync(fileURLToPath(new URL("../categories.json", import.meta.url)), join(registry, "categories.json"));
  mkdirSync(join(registry, "plugins/acme"), { recursive: true });
  writeFileSync(join(registry, "plugins/acme/example.json"), JSON.stringify({
    id: "acme/example", categories: ["utils"],
    artifact: { kind: "git", remote: "https://github.com/acme/example.git", commit: "a".repeat(40) },
    repository: { url: "https://github.com/acme/example" },
    submittedAt: "2026-09-12", reviewedAt: "2026-09-12",
  }));
  const validate = (featured: unknown) => {
    writeFileSync(join(registry, "featured.json"), JSON.stringify(featured));
    return spawnSync(process.execPath, ["scripts/validate.ts"], { cwd: registry, encoding: "utf8" });
  };
  for (const [featured, message] of [
    [["acme/missing"], /unknown record "acme\/missing"/],
    [["acme/example", "acme/example"], /duplicate record "acme\/example"/],
    [{ id: "acme/example" }, /must be an array/],
    [[42], /must be an array/],
  ] as const) {
    const result = validate(featured);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, message);
  }
  assert.equal(validate(["acme/example"]).status, 0);
  assert.equal(validate([]).status, 0);
});
