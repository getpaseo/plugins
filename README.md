# Paseo plugins

The registry behind [paseo.sh/plugins](https://paseo.sh/plugins). Every listed plugin is an npm package pinned to one reviewed version.

## How a plugin gets listed

1. Publish the package to npm with `paseo-plugin.json` in it. Optionally add `paseo-listing.json` (see below).
2. Open a [submission issue](../../issues/new?template=submit-plugin.yml) with the package name and categories.
3. A workflow pins the current version, verifies npm provenance when the package has it, and opens a pull request with the record.
4. A maintainer reviews the published tarball and merges. Merging is the approval.
5. The site picks the plugin up on the next publish run.

New versions are not listed automatically. A daily workflow opens a pull request per new version with the diff between the two tarballs, and the listing moves only when that pull request is merged. Until then the site keeps showing, and the install command keeps pinning, the reviewed version.

## Records

One file per plugin in `plugins/<id>.json`:

```json
{
  "id": "dracula",
  "package": "@omercnet/paseo-dracula",
  "version": "1.2.0",
  "integrity": "sha512-…",
  "repository": {
    "url": "https://github.com/omercnet/paseo-plugins/tree/HEAD/paseo-dracula",
    "commit": "d7b3e654f364b5be72edf6fd1d914a3750b53082"
  },
  "categories": ["themes"],
  "submittedAt": "2026-09-17",
  "submittedBy": "omercnet",
  "reviewedAt": "2026-10-03"
}
```

- `version` and `integrity` are the pin. They come from npm and change only through a bump pull request.
- `repository.url` is what the package declares. `repository.commit` is present only when npm provenance proves which commit built the tarball. Without provenance, review the tarball; the repository is a claim.
- `categories` and the optional `listing` block are the only fields a person edits. `listing` overrides `name`, `icon`, and `screenshots` for packages that do not ship `paseo-listing.json`. Values must be `https` URLs; the icon must be a PNG.

Everything else the site shows (name, description, author, readme, icon, screenshots, download counts) is read from npm at build time, at the pinned version, and never committed here.

## What the package can ship

`paseo-listing.json` next to `paseo-plugin.json`:

```json
{
  "name": "Dracula",
  "icon": "icon.png",
  "screenshots": ["docs/screenshot.png", "https://example.com/wide.png"],
  "readme": "LISTING.md"
}
```

Relative paths resolve inside the published tarball at the pinned version. `readme` defaults to the package `README.md`. This is a separate file because the daemon rejects unknown fields in `paseo-plugin.json`.

## Published output

`node scripts/build.ts` writes `dist/`, deployed to GitHub Pages:

- `index.json`: every plugin's summary, author, and download counts, plus the category list. The site searches this client-side.
- `plugins/<id>.json`: the summary plus the readme markdown.

## Maintainers

```sh
node scripts/add.ts @acme/paseo-review --categories git-and-code-review   # pin and write a record locally
node scripts/validate.ts --online                                          # check records against npm
node scripts/bump.ts --dry-run                                             # see pending bumps and write diffs to .tmp/diffs
node scripts/build.ts                                                      # generate dist/
npm test
```

Node 22.18 or newer runs the TypeScript directly. There are no dependencies.

Set the `PLUGINS_BOT_TOKEN` secret to a token with `contents` and `pull-requests` write access. Pull requests opened with the default `github.token` do not trigger the Validate workflow.
