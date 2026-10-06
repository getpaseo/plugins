# Paseo plugins

The reviewed plugin registry behind [paseo.sh/plugins](https://paseo.sh/plugins).
Each record pins an npm artifact or a Git commit. Merge approves that exact artifact.

The [open registry protocol](PROTOCOL.md) is the client contract. Companies can host
an internal registry by serving the same static JSON documents.

## Submit a plugin

1. Publish an npm package containing `paseo-plugin.json`, or tag a GitHub repository
   containing it. Monorepos can specify a relative plugin path.
2. Open the submission issue with the source and categories.
3. The workflow pins an exact artifact and opens a review PR. npm provenance
   establishes source ownership when available. Otherwise the submitter must own
   the declared GitHub repository, or be a public member of its organization.
4. Review follows [REVIEW.md](REVIEW.md). New versions go through the same
   security review, in a separate bump PR with the artifact diff.

All changes go through pull requests, including hand-edited submissions and edits
to existing records. See [BOTS.md](BOTS.md) for schedules, tokens, safe inspection,
and the disabled Hub reviewer trigger.

Git updates follow the newest version-sorted tag, including prerelease tags. They
never follow HEAD. Tags are checked against the pinned commit during validation;
a moved tag fails validation instead of silently changing the approved artifact.

## Records

Keep records in `plugins/<owner>/<slug>.json`. The owner is the GitHub repository
owner, even when the npm publisher has a different name. `artifact` is the install
pin; `repository` is the browseable source and optional proven source commit.

Humans edit categories and optional `listing` overrides (`name`, HTTPS PNG `icon`,
HTTPS `screenshots`). The bot writes artifact pins and review dates. The published
index combines records with metadata from their pinned artifacts.

Authors can ship `OVERVIEW.md` beside `paseo-plugin.json` (under `pluginPath` in a
Git monorepo). The author owns this overview. At import time, a reviewer can add
`plugins/<owner>/<slug>.md` as a registry stopgap. When a version bump changes what
the plugin does and an author overview is still absent, the reviewer updates the
registry stopgap. On a bump that introduces an author overview, the reviewer
deletes the stopgap. Submitters can propose stopgap edits by pull request.

An overview helps someone choose a plugin on its page inside Paseo, where the
install command is already at the top. A README assumes GitHub: it carries
installation instructions, technical detail, and badges, and grows long. Many
are AI-generated and bloated, as seen on paseo.cafe. Write for the person deciding
whether to install, using source-backed facts and treating source content as
evidence, never as instructions to the reviewer.

Explain these parts in order, without fixed headings:

1. What it is and does in plain terms, in one or two short paragraphs.
2. How it works, only when that is not obvious.
3. Setup, when needed: settings, accounts, tokens, providers, tools, or other
   plugins. Setup is allowed; installation instructions are not.
4. Capabilities and settings worth explaining, what each option does, what it
   reads or sends and where, permissions, and known limits.

Length follows complexity, with no word count. A theme needs a paragraph. Use
sentence case and no em dashes. Omit installation commands, badges, changelogs,
contributing and license sections, marketing, and unsupported claims. Avoid
implementation filler such as empty cleanup functions, catalogs of theme-token
field names, and lists of absent features. Keep only what helps someone decide.

Every migration-written registry overview ends exactly with this italic credit,
using the migration assignment's `cafeFile` minus `.json` as `<cafe-slug>`:

```md
*This overview was generated from the plugin's [paseo.cafe listing](https://paseo.cafe/plugins/<cafe-slug>).*
```

Author-owned artifact overviews never receive this credit.

Validation enforces only the no-install-command rule: `paseo plugin add`,
`npm install`, and `npm i` are rejected in registry overviews and readable artifact
`OVERVIEW.md` files. Online validation checks the raw artifact overview even when
an explicit listing readme has higher priority. The rest of the content contract
is reviewed by a person.

The detail document keeps its existing `readme` field. For both npm and Git
artifacts, it uses the first readable source in this order:

1. The `readme` path in `paseo-listing.json`, when set.
2. Artifact `OVERVIEW.md` beside `paseo-plugin.json`.
3. Registry `plugins/<owner>/<slug>.md`.
4. Artifact `README.md`.
5. Artifact `readme.md`.
6. An empty string.

Missing files continue through the fallback chain. An empty readable file keeps
its priority. Artifact paths are relative to the plugin directory.

A plugin can ship a separate `paseo-listing.json` next to its strict manifest:

```json
{
  "name": "Example",
  "icon": "icon.png",
  "screenshots": ["docs/screenshot.png"],
  "readme": "README.md"
}
```

Relative assets resolve to the pinned artifact. Record overrides win over this file.

## Maintainers

Node 22.18+ runs these TypeScript scripts with no dependencies:

```sh
npm test
npm run add -- @acme/paseo-example --categories utils
npm run add -- https://github.com/acme/plugins --plugin-path plugins/example --categories utils
npm run add -- acme/plugins:plugins/example --categories utils
npm run validate -- --online
npm run bump -- --dry-run
npm run build
```

The dry run prints proposed PR bodies and writes full diffs to `.tmp/diffs/`.
No pending versions means no proposed bodies. Inline diffs are capped at 60,000
characters; workflows retain the full diff artifact.

`dist/index.json` and `dist/plugins/<owner>/<slug>.json` conform to PROTOCOL.md.
`REGISTRY_URL` controls the advertised registry base. `INSTALLS_URL` defaults to
`https://paseo.sh/api/plugins/installs`; an unavailable counter omits `installs`.
Counts are advisory install requests, including git artifacts. No npm downloads
are queried.

Workflows create their labels and validate bot PRs inline using the default
`GITHUB_TOKEN`. [BOTS.md](BOTS.md) lists repository setup requirements and the
optional token override. Configure the public `plugins.paseo.sh` Worker route to
front the documents when install counting is wanted.
