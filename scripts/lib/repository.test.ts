import assert from "node:assert/strict";
import { test } from "node:test";
import { browseUrl, githubOwner, normalizeRepositoryUrl, parseRepository } from "./repository.ts";

test("normalizes the repository URL shapes npm accepts", () => {
  const expected = "https://github.com/tomgrin10/paseo-defer";
  assert.equal(
    normalizeRepositoryUrl("git+https://github.com/tomgrin10/paseo-defer.git"),
    expected,
  );
  assert.equal(normalizeRepositoryUrl("git@github.com:tomgrin10/paseo-defer.git"), expected);
  assert.equal(normalizeRepositoryUrl("ssh://git@github.com/tomgrin10/paseo-defer.git"), expected);
  assert.equal(normalizeRepositoryUrl("github:tomgrin10/paseo-defer"), expected);
  assert.equal(normalizeRepositoryUrl("tomgrin10/paseo-defer"), expected);
  assert.equal(normalizeRepositoryUrl("http://github.com/tomgrin10/paseo-defer/"), expected);
  assert.equal(normalizeRepositoryUrl("gitlab:acme/plugin"), "https://gitlab.com/acme/plugin");
  assert.equal(normalizeRepositoryUrl("not a url"), null);
  assert.equal(normalizeRepositoryUrl("https://github.com/only-owner"), null);
});

test("links to the plugin directory inside a monorepo", () => {
  const source = parseRepository({
    type: "git",
    url: "git+https://github.com/omercnet/paseo-plugins.git",
    directory: "paseo-dracula",
  });
  assert.deepEqual(source, {
    url: "https://github.com/omercnet/paseo-plugins",
    directory: "paseo-dracula",
  });
  assert.equal(
    browseUrl(source!),
    "https://github.com/omercnet/paseo-plugins/tree/HEAD/paseo-dracula",
  );
  assert.equal(
    browseUrl({ url: "https://github.com/tomgrin10/paseo-defer" }),
    "https://github.com/tomgrin10/paseo-defer",
  );
  assert.equal(
    browseUrl({ url: "https://gitlab.com/acme/plugins", directory: "review" }),
    "https://gitlab.com/acme/plugins/-/tree/HEAD/review",
  );
  assert.equal(
    browseUrl({ url: "https://forge.example/acme/plugins", directory: "review" }),
    "https://forge.example/acme/plugins",
  );
  assert.equal(parseRepository(undefined), null);
});

test("reads the GitHub owner for avatars", () => {
  assert.equal(githubOwner("https://github.com/omercnet/paseo-plugins/tree/HEAD/x"), "omercnet");
  assert.equal(githubOwner("https://gitlab.com/acme/plugins"), null);
});
