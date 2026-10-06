Provider usage adds a **Usage** surface to the sidebar, also reachable from the Command Center as **Open plan usage**. It shows quota windows with reset times for Claude, Codex and Antigravity, credits and recent activity for OpenRouter, and token totals, estimated cost and a per-model breakdown of your agent activity.

## Setup

The manifest requires Paseo `>=0.8.0`. Quota data comes from the [CodexBar](https://github.com/steipete/CodexBar) CLI, so `codexbar` must be available to the daemon (on `PATH`, in a common install directory, or set with `CODEXBAR_BIN`). Credentials come from accounts you already have:

- **Codex:** the Codex CLI's own sign-in.
- **Claude and Antigravity:** an access token borrowed from OMP if it is installed and signed in, otherwise CodexBar's own sources.
- **OpenRouter:** an API key saved in CodexBar's own configuration for OpenRouter, otherwise the `OPENROUTER_API_KEY` environment variable of the Paseo daemon. A Management key also shows account-wide activity.

## What it reads and sends

The plugin runs `codexbar`, which contacts each provider's quota endpoints for the accounts above. When it uses an OMP token, it passes the token to CodexBar through a temporary config file that it removes after each fetch. For activity totals it reads Paseo's saved agent and session records on the daemon host. Costs are estimates from a built-in price table and session telemetry, not billing figures. The plugin's backend runs unsandboxed beside the daemon.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/provider-usage).*
