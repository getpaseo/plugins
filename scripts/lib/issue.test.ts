import assert from "node:assert/strict";
import { test } from "node:test";
import { readCategories } from "./categories.ts";
import { parseSubmissionIssue } from "./issue.ts";

const body = `### npm package

@acme/paseo-review

### Categories

- [ ] Themes
- [X] Git & code review
- [x] Integrations
- [ ] Utilities

### Listing ID

_No response_
`;

test("reads the package, ticked categories, and optional id from the issue form", () => {
  const categories = readCategories();
  assert.deepEqual(parseSubmissionIssue(body, categories), {
    package: "@acme/paseo-review",
    categories: ["git-and-code-review", "integrations"],
  });
  assert.deepEqual(
    parseSubmissionIssue(
      body
        .replace("_No response_", "review")
        .replace("@acme/paseo-review", "npm:@acme/paseo-review"),
      categories,
    ),
    {
      package: "@acme/paseo-review",
      categories: ["git-and-code-review", "integrations"],
      id: "review",
    },
  );
});

test("rejects an issue with no category", () => {
  const categories = readCategories();
  assert.throws(
    () => parseSubmissionIssue(body.replaceAll("[X]", "[ ]").replaceAll("[x]", "[ ]"), categories),
    /no category/,
  );
  assert.throws(
    () => parseSubmissionIssue("### Categories\n\n- [x] Themes\n", categories),
    /no plugin source/,
  );
});

test("accepts a GitHub source and monorepo path", () => {
  const categories = [{ slug: "themes", label: "Themes", description: "Themes" }];
  assert.deepEqual(
    parseSubmissionIssue(
      "### Plugin source\nhttps://github.com/acme/plugins\n### Plugin path\nplugins/example\n### Categories\n- [x] Themes\n### Listing ID\nexample",
      categories,
    ),
    {
      package: "https://github.com/acme/plugins",
      pluginPath: "plugins/example",
      categories: ["themes"],
      id: "example",
    },
  );
});
