ZeroSub lets Paseo agents use several Claude and ChatGPT (Codex) subscriptions on one host. You pick an account for each agent, and when an account hits its usage limit the agent can move to another account. Your existing `claude` and `codex` CLI logins appear automatically as the default accounts.

## Setup

- The `claude` and/or `codex` CLI must be installed where the daemon runs. If you configured a custom command for either provider in Paseo's config, ZeroSub uses it.
- Open **Accounts (ZeroSub)** in the sidebar, choose **Add account** under Claude or ChatGPT, and sign in. The sign-in runs the official CLI login (`claude auth login`, or Codex's account API). A browser sign-in finishes by itself only when a browser can reach the daemon's machine, so on servers, containers and SSH-started daemons, and whenever you sign in from a device other than the daemon's computer, use **Use a code instead**.
- Each host has its own accounts, default and preferences, and sign-ins are not copied between hosts. To use the same account on two hosts, sign in to it on each.

## Choosing and switching accounts

- Each Claude or Codex agent gets an account button in its message box once a provider has two or more accounts (the **Show the account pill** setting turns this off).
- `/account <name>` sets the agent's account, and `/account default` follows the default again. Command Center entries make an account the default.
- You can disable an account. Claude agents on it move to your other accounts after their current turn and return when you enable it. Existing ChatGPT threads stay on the disabled account, because a Codex thread cannot change accounts; new ChatGPT agents use other accounts. The last usable account of a provider cannot be disabled.
- When a Claude or Codex CLI limit notice appears in an agent's output, ZeroSub moves the agent to the account with the most room and posts a note in the timeline. An agent moves at most 4 times in 10 minutes. Exhausted accounts are skipped until they reset, or until you press **Mark as available again**.
- A Claude agent reopens on the new account with its full history. A ChatGPT thread cannot change accounts, so ZeroSub starts a new continuation agent in the same workspace on the other account, given the conversation so far from the original timeline. A busy agent is never interrupted and moves after its turn.

## Settings

Under ZeroSub preferences (per host):

| Setting | Default | Effect |
| --- | --- | --- |
| Switch accounts when one hits its limit | on | Moves the agent to the account with the most room. |
| Keep going after a switch | on | Sends an editable follow-up message so the interrupted task continues. |
| Spread new agents across accounts | off | New agents start on the account with the most room instead of the default. |
| Use banked resets when every account is out | off | Spends a banked limit reset, only when every account of that provider is at its limit and the provider confirms it. |
| When every account is out, fork the chat to the other provider | off | Continues a stopped Claude chat in a new ChatGPT agent, or the reverse, in a permission mode no more permissive than the original. If the other provider has no mode that careful, the chat is not forked. |
| Show the account pill in the composer | on | Shows the account button on Claude and Codex agents. |

Banked resets can also be used manually from an account card or an agent's account button, after a confirmation.

## What it reads, runs and sends

- Each added account gets its own credential home under `zerosub/homes/` in the daemon's data folder. Paseo sessions on that account run with `CLAUDE_CONFIG_DIR` or `CODEX_HOME` pointing at it. Entries in your main CLI home that are not account-specific are symlinked into each account home. For Claude these include `settings.json`, `skills/` and `projects/` (conversation history). For Codex they include `config.toml` and `sessions/`, and the Codex thread database is shared through `CODEX_SQLITE_HOME`. Credentials, caches, logs and locks stay per account, and Codex's `plugins` folder is per account. Claude's `.claude.json` is kept per account: it is seeded from yours without the account identity, and your MCP servers and project trust settings are re-synced into it from yours.
- `zerosub/state.json` stores account names, emails, plans and which agent uses which account. Usage readings are cached in `zerosub/usage.json`.
- To show Claude usage and use resets, the plugin reads each account's OAuth token (from the macOS keychain or `.credentials.json`) and calls `api.anthropic.com` (`/api/oauth/usage`, and a reset endpoint when you use a reset). It does not store the token. If the token has expired, an explicit usage refresh (the refresh button on Accounts) or a reset can run `claude -p /usage` so Claude Code renews its own sign-in; ordinary background reads do not. Codex usage and resets go through `codex app-server`.
- Removing an account moves its agents to the default, signs it out and deletes its home. An account with ChatGPT threads still on it cannot be removed. Your own CLI login cannot be removed from ZeroSub.
- Failover and account switching restart an agent's session through `paseo agent reload`, which cannot authenticate on a password-protected daemon. There, the switch applies the next time the session starts.

## Limits

- If your shared Claude settings set an `apiKeyHelper` or an API-key environment, every account uses that key instead of its subscription. OAuth-based MCP servers store tokens per Claude account, so sign in to them once on each account.
- Claude usage for an idle account is the last reading (or Claude Code's own cached one) until the account is used or you refresh, and Anthropic rate-limits that endpoint.
- Imported Codex threads belong to your CLI login. Codex device-code sign-in must be enabled in your ChatGPT security settings.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/zerosub).*
