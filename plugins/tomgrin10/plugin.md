Send to Paseo runs a small local HTTP bridge so a companion browser extension can send a pull request, with an instruction, to a Paseo workspace and agent. It creates a worktree checked out to the pull request when no workspace fits. It requires Paseo 0.9.0 or later, and it does nothing on its own without the browser extension, which is a separate install.

## What it does

The extension talks only to the bridge, never to the Paseo daemon. For a pull request page it can:

- **Resolve** the repository to a Paseo project and rank that project's workspaces: the workspace on the pull request's branch first, then workspaces on other branches of the same stack, then any other workspace, and last a "create a worktree for this PR" option. It creates nothing.
- **Send** your instruction. The bridge creates the worktree if needed, then either starts a new agent in the workspace or messages the best existing root agent there, depending on the **Agent destination** setting and the choice in the popover. Provider, model and permission mode can be set per send.

A **Send to Paseo** sidebar screen shows bridge status, the pairing token, settings, the connected Paseo machines, a requirements check and your last 20 sends.

## Setup

1. The companion browser extension must be present in the browser, and plugins must be enabled in Paseo.
2. In the sidebar screen, copy the **Pairing token** and paste it into the extension's options page. **Regenerate** issues a new token and unpairs any extension that has the old one.

Requirements on the daemon host:

| Tool | Required | Used for |
| --- | --- | --- |
| `git` | Yes | Reading workspace branches and the repository's `origin`. Creating a worktree fails without it. |
| `gh` (GitHub CLI) | No | Pull request title, branch names and stack discovery. Without it you can still pick a workspace and send, but the title and branch names are missing and workspaces are not matched by branch or stack, so the default becomes creating a worktree. |

The plugin looks for them in `SEND_TO_PASEO_GIT_PATH` and `SEND_TO_PASEO_GH_PATH` if set, then the daemon's `PATH`, then common install locations (`SEND_TO_PASEO_BIN_DIRS` replaces that last list). It runs them without a shell.

## Settings

All settings are in the sidebar screen.

| Setting | Default | Effect |
| --- | --- | --- |
| Port | `7788` | The bridge always binds to `127.0.0.1`. Saving rebinds it. If the port is in use the bridge does not start and the status line says why. |
| Private bridge address | none | An HTTPS origin, for example from a reverse proxy, at which other machines can reach this bridge. |
| Agent destination | New agent | Start a new agent, or reuse the best non-archived root agent in the target workspace. |
| Default model | The daemon's default | `provider/model`, overridable per send. |
| Agent profile | none | A saved Paseo profile, followed live on every send. An explicit provider in the request wins over the profile's. |
| Default permission mode | Follow Paseo | A mode id for new agents. A mode the chosen provider does not offer is skipped and the next fallback is used. |

## Several Paseo machines

The browser can use one bridge, on the Primary Paseo machine beside the browser, which forwards to other machines. On an additional machine, **Share this Paseo machine** turns on private access and copies a connection code, and on the Primary machine you paste the code under **Paseo machines**. The code contains that machine's URL and token, so treat it as a secret. The Primary bridge sends authenticated HTTPS requests to the additional machine's bridge, checks its identity before use, and gives resolve 9 seconds and send 55 seconds.

The **Enable private access** button runs `tailscale serve --bg <port>` on the machine where you press it, which publishes the loopback bridge on your tailnet over HTTPS. If Tailscale is not found, run that command yourself and enter the printed HTTPS origin as the **Private bridge address**. Use Serve, not Funnel, since Funnel is public. `SEND_TO_PASEO_TAILSCALE_PATH` points at a `tailscale` binary in an unusual location.

## What it reads, stores and sends

- **Access control.** Every endpoint except `GET /v1/ping` needs the bearer token. Requests carrying a page `Origin` that is not a `chrome-extension://` origin are refused, and the `Host` header must be a loopback name or the declared private bridge address. Request bodies are capped at 64 KiB and requests are rate limited to 60 per 10 seconds.
- **Stored data.** `$PASEO_HOME/plugin-data/send-to-paseo/settings.json` (mode `0600`) holds the token, port, defaults, last 20 sends, connection codes and tokens for additional machines, and optionally a daemon password.
- **Daemon password.** If the daemon requires a password, the plugin takes it from `SEND_TO_PASEO_DAEMON_PASSWORD`, then `PASEO_PASSWORD`, then a daemon password file in a default location, then `daemonPassword` in its settings file. Passwords are not logged.
- **GitHub.** `gh` calls (`pr view`, `pr list`, `repo view`) go to GitHub using whatever account `gh` is signed in to, and Paseo checks the pull request out through its own forge credentials. Stack detection also runs `git branch --contains` in the project root.
- **Agents.** A send starts or messages an agent that can run code on the daemon host with the permission mode you chose, so only pair extensions and machines you trust.

## Limits

- `SEND_TO_PASEO_DRY_RUN=1`, set in the daemon's environment before it starts, makes sends resolve and validate without creating or messaging anything.
- `gh` lookups are cached for 60 seconds, and merged or closed stack members come from the 200 most recent closed pull requests.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/send-to-paseo).*
