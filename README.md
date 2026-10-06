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

Each listing can have a curated overview at `plugins/<owner>/<slug>.md`, maintained
in this registry. Submitters may propose overview edits by pull request. The
reviewer updates the overview when a version bump changes what the plugin does.

The overview describes what the plugin does, its requirements, and considerations
such as permissions, data access, and known limits. Use plain declarative sentences
and source-backed facts. Omit installation instructions, badges, changelogs, and
contributing sections. Validation rejects `paseo plugin add`, `npm install`, and
`npm i` commands.

The detail document publishes the overview in its existing `readme` field. When
there is no overview, the artifact README remains the fallback.

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
