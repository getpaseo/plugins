# Paseo plugin registry protocol v1

A registry is a set of static JSON files served over HTTPS. You can run your own,
public or internal, with any static host: no Paseo infrastructure, database, or
account service. Each file pins one reviewed artifact, and the Paseo daemon installs
exactly that artifact when someone runs `paseo plugin add`.

## Serve a registry

Publish one detail document per plugin, and optionally a directory:

| URL | Needed for | Read by |
| --- | --- | --- |
| `<base>/plugins/<owner>/<slug>.json` | Installs and updates | The Paseo daemon |
| `<base>/index.json` | Browsing and search | Directory clients such as [paseo.sh/plugins](https://paseo.sh/plugins) |

The daemon never reads `index.json`. A registry used only from the CLI needs only
the detail documents.

IDs are lowercase `<owner>/<slug>`, and each segment matches
`[a-z0-9]+(?:-[a-z0-9]+)*`. In the public registry the owner is the GitHub owner of
the source repository; in your registry you choose the owners.

For an install, the daemon reads `id` and `artifact` and ignores every other field.
`id` must equal the requested ID. This is a complete installable document for
`acme/example`:

```json
{
  "id": "acme/example",
  "artifact": {
    "kind": "git",
    "remote": "https://github.com/acme/paseo-plugins.git",
    "commit": "0123456789abcdef0123456789abcdef01234567",
    "pluginPath": "plugins/example"
  }
}
```

Directory clients need the full entry described in [Directory](#directory), so
publish the full entry when you also publish `index.json`. See
[Artifact pins](#artifact-pins) for the `artifact` variants.

The host must:

- Serve the documents as `application/json`. The daemon parses the body without
  checking the header.
- Return 404 for unknown IDs. Paseo reports
  `Plugin acme/missing was not found in registry plugins.example.com`. Any other
  non-2xx status fails with `Registry plugins.example.com returned 401 for acme/example`.
- Answer with the document itself, never a redirect. The daemon fetches with
  redirects disabled, so a 301 or 302 fails with
  `Could not reach plugin registry <url>`.
- Use HTTPS. A per-install host address is always fetched over HTTPS. Plain HTTP
  works only through `PASEO_PLUGIN_REGISTRY` and is meant for local development.
- Expect caching to delay new pins. Installs and update checks see a new pin once
  every cache between the daemon and your origin has expired the old document.
- Allow CORS on `index.json` and the detail documents if a browser reads them from
  another origin.

## Deploy a registry

### GitHub Pages

1. Create a repository, for example `acme/paseo-registry`, and add the detail
   documents under `site/`:

   ```text
   site/
     index.json                    (optional)
     plugins/
       acme/
         example.json
   ```

2. Add `.github/workflows/pages.yml`:

   ```yaml
   name: Publish registry
   on:
     push:
       branches: [main]
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment:
         name: github-pages
       steps:
         - uses: actions/checkout@v4
         - uses: actions/upload-pages-artifact@v3
           with:
             path: site
         - uses: actions/deploy-pages@v4
   ```

3. In the repository settings, under **Pages**, set the source to **GitHub Actions**,
   then push to `main`.

4. Check the published document:

   ```sh
   curl -i https://acme.github.io/paseo-registry/plugins/acme/example.json
   ```

The site address decides how people install from it:

| Site | Base | Install with |
| --- | --- | --- |
| Project site, `https://acme.github.io/paseo-registry` | Has a path prefix | `PASEO_PLUGIN_REGISTRY=https://acme.github.io/paseo-registry`, then `paseo plugin add acme/example` |
| User or organization site (repository named `acme.github.io`) | `https://acme.github.io` | `paseo plugin add acme.github.io/acme/example` |
| Custom domain, `plugins.acme.com` | `https://plugins.acme.com` | `paseo plugin add plugins.acme.com/acme/example` |

With a custom domain, GitHub redirects the `github.io` address to that domain, and
the daemon rejects the redirect. Use the custom domain in every install command.

GitHub Pages sends `Cache-Control: max-age=600`, so a new pin can take up to
10 minutes to reach installs and update checks. A public Pages site cannot require
a credential. Host a private registry where you can check the `Authorization`
header.

This repository publishes the public registry the same way: `npm run build` writes
the documents to `dist/`, and `.github/workflows/publish.yml` deploys them.

### Any static host

Upload the same file tree to any HTTPS host. This nginx server block serves a
registry from `/srv/paseo-registry` and requires a bearer token for the detail
documents:

```nginx
server {
  listen 443 ssl;
  server_name plugins.example.com;
  ssl_certificate     /etc/ssl/plugins.example.com.crt;
  ssl_certificate_key /etc/ssl/plugins.example.com.key;
  root /srv/paseo-registry;
  default_type application/json;
  add_header Cache-Control "max-age=60" always;

  location /plugins/ {
    if ($http_authorization != "Bearer company-token") { return 401; }
    try_files $uri =404;
  }

  location / {
    try_files $uri =404;
  }
}
```

Drop the `if` line for a public registry. Turn off trailing-slash and HTTPS
redirects for these paths at any CDN or proxy in front of the host.

## Install from your registry

`paseo plugin add` (alias of `paseo plugin install`) sends the source to the daemon,
and the daemon fetches the detail document:

| Command | Daemon fetches |
| --- | --- |
| `paseo plugin add acme/example` | `<default base>/plugins/acme/example.json` |
| `paseo plugin add plugins.example.com/acme/example` | `https://plugins.example.com/plugins/acme/example.json` |
| `paseo plugin add plugins.example.com:8443/acme/example` | `https://plugins.example.com:8443/plugins/acme/example.json` |

The host form always uses HTTPS and the root of the host; it cannot carry a path
prefix. The first segment counts as a host only when it contains `.` or `:`.

The default base is `https://plugins.paseo.sh`. To make bare `owner/slug` IDs
resolve against your registry, set `PASEO_PLUGIN_REGISTRY` in the environment of
the daemon process and restart the daemon. Setting it in the shell that runs the
CLI has no effect on a daemon that is already running.

```sh
PASEO_PLUGIN_REGISTRY=https://acme.github.io/paseo-registry
```

This base may include a path prefix and may use `http://` for local development.
The public registry stays reachable as `paseo plugin add plugins.paseo.sh/owner/slug`.

Registry installs use the pinned revision and path. `--ref` and a `:path` suffix
are rejected; to choose a revision, install from GitHub instead.

### Private registry credentials

Put the credential in the daemon configuration, `$PASEO_HOME/config.json`
(`~/.paseo/config.json` by default), keyed by the registry host, and restart the
daemon:

```json
{
  "pluginRegistries": {
    "plugins.example.com": { "authorization": "Bearer company-token" }
  }
}
```

- The key is the URL host, including a non-default port:
  `"plugins.example.com:8443"` or `"127.0.0.1:8080"`.
- The daemon sends the value as the `Authorization` header to that host only.
  Redirects are rejected, so the header never follows one.
- Credentials require HTTPS. The only exceptions are `localhost`, `127.0.0.1`,
  and `[::1]`.
- Never put credentials in the base URL, records, or install commands. The daemon
  rejects a base URL with a username or password.

### Artifact access

The registry credential is used only for the registry. The daemon downloads the
artifact with npm or git running as the daemon's user, so that user's own
credentials apply: `~/.npmrc` for npm, and credential helpers or SSH keys for git.
Git runs with prompts disabled, so private remotes need credentials that work
without a prompt.

### Updates

The daemon stores the registry URL and ID with the installation, and update checks
read that same document, even after `PASEO_PLUGIN_REGISTRY` changes. Use the runtime
plugin ID shown by `paseo plugin ls`:

```sh
paseo plugin update example --check   # compare the installed revision with the pin
paseo plugin update example --yes     # install the new pin
paseo plugin update --all
```

An update installs only the current pin. `--ref` and `--version` are rejected for
registry installs, and the daemon never substitutes npm latest or Git HEAD. If the
pin moves to a different npm package, Git remote, or `pluginPath`, the update fails
with `Registry artifact source changed; reinstall to approve the new source`.

## Install from GitHub without a registry

An explicit GitHub source bypasses every registry:

```sh
paseo plugin add github:acme/example
paseo plugin add github:acme/paseo-plugins:plugins/example
paseo plugin add github:acme/paseo-plugins:plugins/example --ref v1.2.0
```

The `:path` suffix is relative to the repository root, with no leading slash.
`--ref` accepts a branch, tag, or commit. Keep the `github:` prefix: without it,
`acme/paseo-plugins` is a registry ID.

## Directory

```json
{
  "schemaVersion": 1,
  "registry": { "name": "Company plugins", "url": "https://plugins.example.com" },
  "categories": [{ "slug": "utils", "label": "Utils", "description": "Tools" }],
  "featured": [],
  "plugins": [],
  "generatedAt": "2026-10-03T00:00:00.000Z"
}
```

The optional `featured` array contains maintainer-selected plugin IDs in display order,
filtered to plugins present in the published directory.

Each `plugins` entry has the shape below, omitting `readme`. The detail document for
a directory client is that same entry with `readme` (Markdown).

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

npm versions must be exact. The daemon installs from `resolved` and rejects the
package unless the installed version, `resolved` URL, and SHA-512 `integrity` match
the pin, before any package code runs. `resolved` may point at a private npm
registry.

Git commits must be full hashes; clients check out that exact commit. `remote` is
an `https://`, `ssh://`, `git://`, or `file://` URL, or scp-style `git@host:path`.
`pluginPath` defaults to the repository root and must stay within it. Reject
missing pins and unsupported artifact kinds. A future artifact kind (such as a
tarball) requires explicit client support; it is not an npm fallback.

## Install counts

Installation fetches the detail document with `X-Paseo-Install: 1`. Update checks
fetch the same document without this header. A static host may ignore the header.

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
These are hosting conveniences; a conforming private registry only needs the
static documents. The public registry host must route its detail requests through
the resolver to collect install intent.

## Compatibility and review

Ignore unknown object fields. New v1 fields remain optional. Do not remove fields,
change their types, or reinterpret an existing kind. Clients reject unsupported
schema versions rather than guessing. Every new artifact pin needs review before
publication; merging a registry record approves that artifact.
