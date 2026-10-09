# Paseo plugins

The reviewed plugin registry behind [paseo.sh/plugins](https://paseo.sh/plugins).
Each record pins an npm artifact or a Git commit. Merge approves that exact artifact.

The [open registry protocol](PROTOCOL.md) is the client contract. Companies can host
an internal registry by serving the same static JSON documents.

## Submit a plugin

1. Open the submission form and use your plugin's name as the issue title.
2. In **Source**, paste its GitHub repository or folder URL, npm package page or
   name, or Git/npm source accepted by `paseo plugin add`, then tick its categories.
   Registry ids and local directories cannot be submitted.
3. The bot opens a review PR containing your submission. Git tags and commits
   are optional. When supplied, the reviewer uses that reference; otherwise the
   reviewer resolves the current `main` commit. npm submissions use the supplied
   version, or `latest` when omitted.
4. The reviewer inspects the artifact under [REVIEW.md](REVIEW.md), completes the
   listing, and tags you in the outcome. Approved listings appear on
   [paseo.sh/plugins](https://paseo.sh/plugins).

Intake checks that the source is understandable. Missing categories, overviews,
screenshots, source provenance, or unrelated registry failures do not prevent a
review PR. Identity, artifact contents and listing completion belong to review.

Issue edits retry intake automatically. Every 30 minutes, intake also recovers
open submissions without a PR. Once a PR exists, the reviewer owns it and reads
updates from the linked issue; intake never overwrites the reviewer's edits.
Service failures receive an acknowledgement and retry without a maintainer hold.

npm updates receive automatic bump PRs. **Git updates are manual:** open a new
submission with the desired reference, or propose a new commit in the existing
registry record. The reviewer resolves and reviews that update. Git repositories
are never scanned for newer tags or commits by the bump workflow.

See [BOTS.md](BOTS.md) for the workflow and reviewer responsibilities.

## Records

Keep records in `plugins/<owner>/<slug>.json`. The owner is the GitHub repository
owner, even when the npm publisher has a different name. `artifact` is the install
pin; `repository` is the browseable source and optional proven source commit.

Humans edit categories and optional `listing` overrides (`name`, HTTPS PNG `icon`,
HTTPS `media`). The bot writes artifact pins and review dates. The published
index combines records with metadata from their pinned manifests. See
[plugin metadata](#plugin-metadata) for fields and override precedence.

Authors can ship `OVERVIEW.md` beside `paseo-plugin.json` in the submitted artifact.
For npm, include both files at the published package root. The registry reads them
from the verified tarball at the pinned version; repository metadata and provenance
are not needed to read package files. For GitHub, include them at the pinned
commit, under `artifact.pluginPath` for a monorepo.

When the artifact has no overview, the listing uses `plugins/<owner>/<slug>.md`
from the registry. New submissions can reach review without either file; the
reviewer writes the registry overview before approval. Bumps retain that page
and the reviewer updates it for changed behavior. When a release supplies the
author's own overview, it takes precedence and the bump removes the registry copy.
Authors and submitters may propose registry-copy replacements by pull request.

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

Every migration-written registry overview ends exactly with this italic credit.
`<cafe-slug>` is the paseo.cafe record filename without `.json`:

```md
*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/<cafe-slug>).*
```

Author-owned artifact overviews never receive this credit.

Publication validation requires an author or registry overview and rejects `paseo plugin add`, `npm install`, and
`npm i` in both author overviews and registry overviews. The rest of the content
contract is reviewed by a person.

The detail document keeps its existing `readme` field. It publishes the pinned
author `OVERVIEW.md`, or the registry overview when author content is absent.
With neither source it fails. `README.md` and `readme.md` are never used for
overview content automatically; the reviewer uses the README to write a suitable page.

## Plugin metadata

Declare your display name, icon, screenshots, and demo videos in `paseo-plugin.json`:

```json
{
  "id": "example",
  "name": "Example",
  "description": "A short description of what the plugin does.",
  "icon": "assets/icon.png",
  "media": ["assets/screenshot.png", "https://example.com/demo.mp4"],
  "requirements": { "paseo": ">=0.11.0" }
}
```

`name`, `icon`, and `media` are optional manifest fields. Include only assets
that exist in your release. `icon` is a package-relative PNG path. Each `media`
entry is a package-relative path or an HTTPS URL with an image extension
(`png`, `jpg`, `jpeg`, `webp`, `gif`) or video extension (`mp4`, `webm`).
SVG and URLs without a supported extension are not accepted by the registry.
Paths use forward slashes and stay inside the plugin directory. For npm,
include local asset files in the published package's `files` list.

The registry reads the manifest from the pinned npm tarball or Git commit.
Relative assets become URLs pointing to that version, under `pluginPath` for
Git monorepos. Media keep their declared order; cards use the first image.
Manifests declaring these fields require Paseo 0.11.0 or later.

The existing record's `listing` values override the manifest **per field**:

| Field | First choice | Otherwise |
| --- | --- | --- |
| Name | `listing.name` | Manifest `name`, then a humanized registry id |
| Icon | `listing.icon` | Manifest `icon`, or no icon |
| Media | `listing.media` | Manifest `media`, or an empty array |

An explicit `listing.media: []` replaces all manifest media. The submission
bot saves the issue title as `listing.name`. Maintainers can keep using the
same overrides without changing existing records.

The registry does not read `paseo-listing.json`. Move its metadata into the
manifest when publishing a new release.

Categories describe where a plugin is listed. Selecting **Themes** does not
identify the plugin as a theme or trigger a screenshot requirement in the
submission bot. The PR reviewer determines which screenshots are needed from
what the plugin does, following [the review policy](REVIEW.md#content).

## Maintainers

Node 22.18+ runs these TypeScript scripts with no npm dependencies. Git and tar
must be available on PATH:

```sh
npm test
npm run add -- @acme/paseo-example --categories utils
npm run add -- https://github.com/acme/plugins --plugin-path plugins/example --categories utils
npm run add -- acme/plugins:plugins/example --categories utils
npm run add -- https://github.com/acme/plugin --commit "$COMMIT" --categories utils
npm run add -- acme/plugins:plugins/example --commit "$COMMIT" --categories utils
npm run validate -- --online
npm run bump -- --dry-run
npm run build
```

`COMMIT` in these examples is the full 40-character SHA. `--commit` is supported
by the maintainer add command for GitHub sources. It pins
that exact reachable commit and records no tag. Without it, the reviewer command resolves the supplied source ref, or `main` when omitted. The manifest and author overview belong at
the pin, under `--plugin-path` (or the shorthand path) for a monorepo.

Online validation checks records against their pinned artifacts.
`--changed` limits online checks to committed record and overview changes since
the merge base of `origin/main` and `HEAD`; `--base <ref>` selects another base:

```sh
node scripts/validate.ts --online --changed
```

The same command accepts a registry overview for new submissions and changed
pins. No import label or validation exception is needed. Submission intake writes `submissions/<issue>.json` rather than an installable
record. The reviewer replaces it with the pinned record and completes the overview
before merging. Validation and publication reject unresolved submission files.

When a bump finds the author's overview, its commit removes the registry copy.
When the file is absent, the bump retains the registry overview for review and
publication. If both are missing, the reviewer writes one before approval.
Other validation failures are reported in the PR body and workflow log.
Invalid overview content or an artifact lookup failure stops the bump before
changing branches or records.

The dry run prints proposed PR bodies and writes full diffs to `.tmp/diffs/`.
No pending versions means no proposed bodies. Inline diffs are capped at 60,000
characters; workflows retain the full diff artifact.

`dist/index.json` and `dist/plugins/<owner>/<slug>.json` conform to PROTOCOL.md.
`REGISTRY_URL` controls the advertised registry base. `INSTALLS_URL` defaults to
`https://paseo.sh/api/plugins/installs`; an unavailable counter omits `installs`.
Counts are advisory install requests, including git artifacts. No npm downloads
are queried.

Workflows create their labels using the default `GITHUB_TOKEN`.
Submission intake leaves artifact validation to review; npm bumps include validation details. [BOTS.md](BOTS.md) lists repository setup requirements and the
optional token override. Configure the public `plugins.paseo.sh` Worker route to
front the documents when install counting is wanted.
