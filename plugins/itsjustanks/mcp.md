Manages MCP servers from Paseo. Paseo's interface calls them **Connectors**, and the plugin adds a Connectors page to the sidebar. From there you can browse a gallery and add connectors, see which ones work, sign in to the ones that need it, and keep your AI apps (Claude, Codex, Kimi, Grok) in step. Requires Paseo 0.9.0 or later.

## What you can do

- **Add from a gallery.** The gallery shows recommended official connectors plus any libraries you subscribe to. Before anything is written you see the exact change per file, with secrets masked, and a backup is made before each config write. A name that is already taken is never replaced.
- **Copy to all my AI apps.** Previews, then copies every user-level connector to the apps and accounts that lack it. It never removes or overwrites, and never copies a sign-in.
- **See health.** Each connector is checked and flagged if it is broken or needs sign-in. A chip appears on a chat's composer only when a connector that chat loads is broken or needs sign-in. For HTTP connectors the check contacts the endpoint and the page lists the tools it offers. For connectors that run a local command (stdio), the check only confirms the command is found on the host's `PATH`. The health and tools checks do not start those commands, so no tools are listed for them.
- **Sign in.** OAuth sign-in runs through your installed Claude or Codex CLI. The page shows the sign-in URL as a fallback.
- **Switch per workspace.** Turn connectors on or off for a workspace, and see which ones an agent used and which it loaded without using. The page also estimates the context and process cost of what a workspace loads, and shows Paseo's own built-in tools so you can switch them.
- **Edit by hand.** Add, rename, edit, import, export, or remove a connector from one app, all apps, or project `.mcp.json` files. Secrets are masked by default, and you can reveal them or include keys in an export.

## Setup

You can browse and manage connectors without any setup. Sign-in features need the `claude` or `codex` CLI installed on the host. A connector that needs a key or token asks for it when you add it. Adding project connectors to new agents is optional and off by default. To turn it on, open Command Center and run **Add project connectors to agents**. It adds a workspace's `.mcp.json` connectors to every new agent, for Codex by default (Claude is selectable), and by default leaves out connectors that have a key or token written into their settings.

Background health checks are on by default and run every 10 minutes. You can change the interval or turn them off under **Health checks**. They pause after 15 minutes without plugin activity.

## Libraries

The default library is the MCP Gallery, a JSON list at `raw.githubusercontent.com/itsjustanks/mcp-gallery/main/v0.2/servers.json`. The official MCP Registry (`registry.modelcontextprotocol.io`) is listed but off until you enable it. You can add your own libraries by HTTPS address or by a file path on the host, for example a team list. A private library can send a header you set; its value is write-only, stored on the host, and sent only to the site it was set for. Entries that contain literal keys, `${...}` references, or unpinned package versions are refused and listed with the reason.

## What it reads, writes, and contacts

- **Config files.** It reads and writes the user-level MCP config of Claude, Codex, Kimi, and Grok (including multiple accounts), and project `.mcp.json` files.
- **Credentials.** It reads Codex's `.credentials.json` and `auth.json` to show sign-in status and which account is signed in.
- **Endpoints.** Health and tools requests go to the HTTP endpoints you have configured, with the headers you configured.
- **Commands it runs.** It calls your installed `claude` or `codex` CLI for OAuth sign-in and sign-out, runs `codex mcp list --json` to read Codex sign-in state in the background, and, for one case, adding a Google, HubSpot, or Zoom connector with your own OAuth client, runs `claude mcp add-json`.
- **Other reads.** It reads the AI Router plugin's routing settings, if present, for its context and tool-search estimates. It also asks the local Paseo daemon for its list of built-in tools, only when the daemon has no password. Refresh asks again.
- **Settings.** Health checks and project-connector injection are saved as host-wide plugin settings.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-mcp).*
