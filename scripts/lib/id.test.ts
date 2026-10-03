import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveId } from "./id.ts";

test("derives listing ids from npm names", () => {
  assert.equal(deriveId("@omercnet/paseo-dracula"), "dracula");
  assert.equal(deriveId("paseo-defer"), "defer");
  assert.equal(deriveId("@alhassanaraouf/paseo-base2tone-theme"), "base2tone-theme");
  assert.equal(deriveId("@sayrio/paseo-plugin"), "sayrio");
  assert.equal(deriveId("@acme/review-paseo-plugin"), "review");
  assert.equal(deriveId("paseo"), "paseo");
});
