# Paseo plugin registry protocol v1

A registry is an HTTPS base URL serving JSON. You do not need Paseo infrastructure,
a database, or an account service. Publish these two documents to install one plugin:

- `GET <base>/index.json`, the searchable directory.
- `GET <base>/plugins/<owner>/<slug>.json`, the plugin record and README.

The base may include a path prefix. Return `application/json`, and 404 for unknown
plugins. Browser consumers need CORS when accessing the registry across origins.

## Directory

```json
{
  "schemaVersion": 1,
  "registry": { "name": "Company plugins", "url": "https://plugins.example.com" },
  "categories": [{ "slug": "utils", "label": "Utils", "description": "Tools" }],
  "plugins": [],
  "generatedAt": "2026-10-03T00:00:00.000Z"
}
```

Each `plugins` entry has the shape below, omitting `readme`. The detail document is
that same entry with `readme` (Markdown). IDs are lowercase `<owner>/<slug>`;
each segment matches `[a-z0-9]+(?:-[a-z0-9]+)*`. The owner is the verified GitHub
user or organization that owns the source repository.

```json
{
  "id": "acme/example",
  "name": "Example",
  "description": "An internal Paseo plugin",
  "categories": ["utils"],
  "author": { "github": "acme", "name": "Acme" },
  "repository": { "url": "https://github.com/acme/example" },
  "artifact": {
    "kind": "git",
    "remote": "https://github.com/acme/example.git",
    "commit": "0123456789abcdef0123456789abcdef01234567"
  },
  "media": [],
  "submittedAt": "2026-10-03T00:00:00.000Z",
  "reviewedAt": "2026-10-03T00:00:00.000Z",
  "updatedAt": "2026-10-03T00:00:00.000Z",
  "publishedAt": "2026-10-03T00:00:00.000Z",
  "readme": "# Example\nInternal plugin."
}
```

Optional fields: `license` (string), `author.name`, `author.npm`,
`repository.commit` (full commit SHA), `icon` (HTTPS PNG URL), and `installs`
(nonnegative integer). Media are HTTPS URLs whose paths end in the extensions
`png`, `jpg`, `jpeg`, `webp`, `gif`, `mp4`, or
`webm` (case-insensitive). Keep their display order; the card thumbnail is the first
image entry, even when a video comes first. Dates use ISO 8601.

## Artifact pins

Install only `artifact`, never derive an install source from `repository` or README.
Supported variants:

```json
{
  "kind": "npm",
  "package": "@acme/example",
  "version": "1.2.3",
  "resolved": "https://registry.npmjs.org/@acme/example/-/example-1.2.3.tgz",
  "integrity": "sha512-BASE64_DIGEST"
}
```

```json
{
  "kind": "git",
  "remote": "https://github.com/acme/example.git",
  "commit": "0123456789abcdef0123456789abcdef01234567",
  "pluginPath": "plugins/example"
}
```

npm versions must be exact and clients must verify SHA-512 integrity before
executing package code. Git commits must be full hashes; clients check out that
exact commit. `pluginPath` defaults to the repository root and must stay within
it. Reject missing pins and unsupported artifact kinds. A future artifact kind
(such as a tarball) requires explicit client support; it is not an npm fallback.

## Addressing and credentials

- `owner/slug` uses `https://plugins.paseo.sh`.
- `host/owner/slug` uses `https://host`; the host segment contains `.` or `:`.
- `PASEO_PLUGIN_REGISTRY=<base>` changes the default base, including a path prefix.
  HTTP is supported for local development; use HTTPS for credentials.
- `github:owner/repo` explicitly selects GitHub, bypassing the registry.

Private registry credentials belong in daemon configuration:

```json
{
  "pluginRegistries": {
    "plugins.example.com": { "authorization": "Bearer company-token" }
  }
}
```

Match credentials by URL host (including an explicit port). Send `Authorization`
only to that registry host, never to artifact hosts or redirected requests.
Artifact authentication remains npm/git's responsibility. Never publish credentials
in source identities, records, logs, or update proposals.

## Installs and updates

Installation resolves the detail document with `X-Paseo-Install: 1`. Update checks
fetch the same document without this header. A static host may ignore the header.
The daemon preserves the registry URL and ID and checks that registry for updates.
It never substitutes npm latest or Git HEAD for a registry pin.

A registry may count install-intent resolutions, storing no client identifiers.
These are advisory counts of install requests, not confirmed successful installs
or unique users. Concurrent KV updates may undercount. Counts must never affect
resolution or installation success.

Optional endpoints:

- `GET <base>/installs.json`: an object mapping plugin IDs to nonnegative integers.
- `POST <base>/installs/<owner>/<slug>`: alternative advisory counter for clients
  that report after installation. Implementations must choose one counting path
  to avoid double counting. Clients ignore failures, including 404.

The public website also exposes `GET /api/plugins/resolve/<owner>/<slug>` as a
cached resolver with the same install-intent semantics (`?intent=install` is an
alternative), and `GET /api/plugins/installs` for its build-time counts join.
These are hosting conveniences; a conforming private registry only needs the two
static documents. The public registry host must route its detail requests through
the resolver to collect install intent.

## Compatibility and review

Ignore unknown object fields. New v1 fields remain optional. Do not remove fields,
change their types, or reinterpret an existing kind. Clients reject unsupported
schema versions rather than guessing. Every new artifact pin needs review before
publication; merging a registry record approves that artifact.
