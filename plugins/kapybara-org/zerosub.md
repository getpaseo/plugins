ZeroSub lets Paseo agents use several Claude and ChatGPT (Codex) subscriptions on one host. You choose an account per agent, and when an account hits its usage limit the agent can move to another one. Your existing `claude` and `codex` CLI logins appear automatically as the default accounts.

## Setup

The `claude` and/or `codex` CLI must be installed where the daemon runs. Add accounts under **Accounts (ZeroSub)** in the sidebar, which runs the official CLI sign-in. A browser sign-in only completes when a browser can reach the daemon's computer, so on servers, containers or SSH-started daemons, or from another device, use the code option. Each host keeps its own accounts and settings, and sign-ins are never copied between hosts, so sign in again on each host that should use an account.

## Switching

Each Claude or Codex agent gets an account button in its message box once a provider has two or more accounts, and `/account <name>` does the same from the keyboard. Automatic switching is on by default: when the CLI reports a usage limit, an idle agent moves to the account with the most room left and a timeline note says so, and a busy agent moves after its turn.

Changing the default account moves open Claude agents immediately when idle, or after their current turn. Turn off **Move open agents when the default changes** in Accounts or ZeroSub preferences to keep those agents pinned to their current usable account, including after reopening. New agents use the new default; kept agents still switch if their account reaches a limit. Choose **Follow default** or use `/account default` to return an agent to the default.

A Claude conversation moves in place and keeps its history. A Codex thread cannot change accounts, so ZeroSub continues the task in a separate account-bound agent in the same workspace. It creates that tab on the first switch and reuses it on later switches when its account, workspace and permission mode still match. Separate tasks keep separate tabs. Returning to a tab sends the user instructions and progress it has not seen; very long instructions are shortened, keeping the first and most recent ones and noting omissions. The destination agent is told to check current files and the Git diff before continuing.

Automatic switches and resets follow the task’s most recently used tab. Switching is refused while another tab in the task is working or awaiting permission, and the source tab must have stopped. If a handoff cannot be confirmed, the switch stops and identifies the tab to check. Disabling an account leaves its existing ChatGPT threads on it.

Two options are off by default. One spends a provider's banked limit reset automatically, with no per-reset confirmation, when every account of that provider is out. The other continues a stopped chat on the other provider (Claude to ChatGPT or back) in a new agent with no more permissions than the original. You can also use a banked reset by hand, and that always asks for confirmation first.

## Access and limits

Handoffs send conversation text and summaries of tool actions to the destination agent’s provider and account. This includes a cross-provider transfer when that option is enabled or you confirm a manual fork. The plugin stores continuation links and timeline positions in its state file; handoff text remains in agent conversation histories rather than a separate plugin transcript. On Paseo 0.13 and later, limit detection reads the finished turn from the agent timeline when the turn hook contains no conversation.

Each added account gets its own credential home inside the daemon's data folder, and sessions on that account run with `CLAUDE_CONFIG_DIR` or `CODEX_HOME` pointed at it. Settings, skills and conversation history are shared with your main CLI home, while credentials and caches stay per account.

To show Claude usage and use resets, the plugin reads each account's OAuth token from the macOS keychain or a `.credentials.json` file and sends it to `api.anthropic.com`. It does not store the token. An explicit usage refresh or a reset may run `claude -p /usage` so Claude Code renews an expired sign-in. Codex usage and resets go through `codex app-server`. Removing an account signs it out and deletes its credential home.

- If your shared Claude settings set an `apiKeyHelper` or an API-key environment, every account uses that key instead of its subscription.
- Switching restarts the agent's session through `paseo agent reload`, which cannot authenticate on a password-protected daemon. There the switch takes effect the next time the session starts.
- Claude usage for an idle account is its last reading until the account is used or you refresh, and Anthropic rate-limits that endpoint.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/zerosub).*
