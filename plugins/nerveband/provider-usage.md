Provider usage adds a **Usage** surface to the sidebar, also reachable from the Command Center as **Open plan usage**. It shows quota windows with reset times and the share consumed for Claude, Codex and Antigravity, and credits and 30-day activity for OpenRouter. Rows at 90% or above turn red. It also shows token totals, estimated cost, sessions and a per-model breakdown of your agent activity over 24 hours, 7, 14 or 30 days, or all time.

## Setup

The manifest requires Paseo `>=0.8.0`.

Quota data comes from the [CodexBar](https://github.com/steipete/CodexBar) CLI, so `codexbar` must be on `PATH`, in `~/.local/bin`, or set with `CODEXBAR_BIN`. Where each provider's credentials come from:

- **Codex:** the Codex CLI's own sign-in.
- **Claude and Antigravity:** an access token borrowed from OMP if it is installed and signed in, otherwise CodexBar's own sources.
- **OpenRouter:** an API key saved in CodexBar's own configuration for OpenRouter, otherwise the `OPENROUTER_API_KEY` environment variable of the Paseo daemon. A Management key also shows account-wide activity.

## What it reads and writes

The plugin runs `codexbar`, which contacts the provider quota endpoints for the accounts above. When it uses an OMP token, it writes a temporary `0600` CodexBar config containing that token and deletes it after each fetch. For activity totals it reads Paseo's saved agent and session records under `~/.paseo/agents`. Costs are estimates from a built-in price table and embedded session telemetry, so they are not billing figures.

It caches the last snapshot, with usage numbers, reset times and account labels, and a token analytics index under `$XDG_STATE_HOME/paseo-provider-usage` (default `~/.local/state`), as `0600` files. A snapshot under 60 seconds old is served without a fetch, and an older one is shown while a refresh runs. **Refresh** forces a new fetch. The backend runs unsandboxed beside the daemon.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/provider-usage).*
