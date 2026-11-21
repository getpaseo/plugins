ZeroSub lets Paseo agents use several Claude and ChatGPT (Codex) subscriptions on one host. You choose an account per agent, and when an account hits its usage limit the agent can move to another one. Your existing `claude` and `codex` CLI logins appear automatically as the default accounts. It also manages several Grok and Cursor sign-ins, Anthropic API keys for Pi agents, and paid Azure OpenAI and AWS Bedrock accounts.

## Setup

The `claude` and/or `codex` CLI must be installed where the daemon runs. Grok, Cursor and Pi sections show up only when their CLI (`grok`, `cursor-agent`, `pi`) runs where the daemon runs and Paseo has a provider for it. Add accounts under **Accounts (ZeroSub)** in the sidebar, which runs the official CLI sign-in. A browser sign-in only completes when a browser can reach the daemon's computer, so on servers, containers or SSH-started daemons, or from another device, use the code option. Each host keeps its own accounts and settings, and sign-ins are never copied between hosts, so sign in again on each host that should use an account.

ChatGPT Team or Business members can be added separately when Codex returns their email; an unknown member cannot replace an existing managed member or add a duplicate workspace account.

## Switching

Each Claude or Codex agent gets an account button in its message box once a provider has two or more accounts, and `/account <name>` does the same from the keyboard. Automatic switching is on by default: when the CLI reports a usage limit, an idle agent moves to the account with the most room left and a timeline note says so, and a busy agent moves after its turn.

Changing the default account moves open Claude agents immediately when idle, or after their current turn. Turn off **Move open agents when the default changes** in Accounts or ZeroSub preferences to keep those agents pinned to their current usable account, including after reopening. New agents use the new default; kept agents still switch if their account reaches a limit. Choose **Follow default** or use `/account default` to return an agent to the default.

A Claude conversation moves in place and keeps its history. A Codex thread cannot change accounts, so ZeroSub continues the task in a separate account-bound agent in the same workspace. It creates that tab on the first switch and reuses it on later switches when its account, workspace and permission mode still match. When the original agent is a sub-agent, the new tab is created under the same parent agent. Separate tasks keep separate tabs. Returning to a tab sends the user instructions and progress it has not seen; very long instructions are shortened, keeping the first and most recent ones and noting omissions. The destination agent is told to check current files and the Git diff before continuing.

Automatic switches and resets follow the task’s most recently used tab. Switching is refused while another tab in the task is working or awaiting permission, and the source tab must have stopped. If a handoff cannot be confirmed, the switch stops and identifies the tab to check. Disabling an account leaves its existing ChatGPT threads on it.

With **Spread new agents across accounts** enabled, new ChatGPT agents prefer a weekly reset within one day when every usable account has complete usage less than 30 minutes old and the selected account has at least 20% left in each window. Otherwise the plugin chooses the account with the most room. Existing agents stay on their accounts.

**Use ChatGPT credits when a limit is reached** is off by default. Enabling it keeps accounts with prepaid credits eligible after their usage windows fill, so new agents can spend paid credits even while another account has room. A limit actually reported by a stopped turn still applies. The account cards and agent menus show available credits.

Two other options are off by default. One spends a provider's banked limit reset automatically, with no per-reset confirmation, when every account of that provider is out. The other continues a stopped chat on the other provider (Claude to ChatGPT or back) in a new agent with no more permissions than the original. You can also use a banked reset by hand, and that always asks for confirmation first.

## Other providers and paid accounts

- **Grok and Cursor.** Add several Grok or Cursor sign-ins and pick the account each new agent starts on. A conversation stays on the account it started on. ZeroSub does not switch these agents on a limit and does not read Grok or Cursor usage. Cursor accounts work on Linux only.
- **Pi.** Add Anthropic API keys for Pi agents, each with an optional base URL and an optional proxy. Pi accounts have no usage bars and never switch automatically. Each added Pi account also gets a launcher script, and each added Claude account gets one too, in `~/.pi-config` and `~/.claude-config` (or the folder named by `ZEROSUB_LAUNCHER_DIR` or `ZEROSUB_PI_DIR`), so you can start the CLI on that account in a terminal.
- **Azure OpenAI and AWS Bedrock.** An Azure OpenAI resource with its API key can be a ChatGPT (Codex) account, and Claude Code on Bedrock can be a Claude account. Bedrock can use the host's AWS credentials, a named profile, or an access key. You are billed per use by Azure or AWS. Turn on **Use paid API accounts when every subscription is out** to let ZeroSub use a paid account instead. Claude can use Bedrock or a key or token for Anthropic’s own endpoint. Custom Claude endpoints are used only when selected. Claude moves back to a subscription when one has room. ZeroSub keeps monthly token counts for paid accounts and uses a price table you can edit.
- **Proxies.** Claude, Pi and API accounts can have their own proxy. To set one for your own CLI login, ZeroSub can edit `~/.claude/settings.json` or Pi's `settings.json`, `auth.json` and `models.json`. It keeps copies of the old files in its backups folder first. A proxy set on Pi's own login is also given to Pi agents as proxy environment variables, and to added Pi accounts that have no proxy of their own, unless a key would cross it over plain `http://`.

## Access and limits

Handoffs send conversation text and summaries of tool actions to the destination agent’s provider and account. This includes a cross-provider transfer when that option is enabled or you confirm a manual fork. The plugin stores continuation links and timeline positions in its state file; handoff text remains in agent conversation histories rather than a separate plugin transcript. On Paseo 0.13 and later, limit detection reads the finished turn from the agent timeline when the turn hook contains no conversation.

Each added account gets its own credential home inside the daemon's data folder, and sessions on that account run with `CLAUDE_CONFIG_DIR` or `CODEX_HOME` pointed at it. Settings, skills and conversation history are shared with your main CLI home, while credentials and caches stay per account. Managed Claude accounts can share the CLI’s sessions directory if you turn on **Use the default sessions folder**. The switch copies session entries without replacing existing files and keeps a backup of the original directory.

On macOS, an added Claude account stays in its current folder if its Keychain entry is too large to move without exposing it on the command line. The account remains available.

For Claude usage, plan information and resets, the plugin reads each account's OAuth token from the macOS keychain or a `.credentials.json` file and sends it to `api.anthropic.com`. It does not store the token. An explicit usage refresh or a reset may run `claude -p /usage` so Claude Code renews an expired sign-in. Background readings can also run it at most every 30 minutes per enabled account when a saved window has passed its reset time, or a window-limited account has no live reading. Codex usage and resets go through `codex app-server`. Removing a managed account deletes its credential home. When removing an account that uses an existing home, you can choose whether to sign out.

API keys and AWS access keys that you enter are stored in the account's own folder, readable only by you, and are sent only to the endpoint you gave: `api.anthropic.com` or your base URL for Anthropic keys, and your Azure endpoint, which must be `https://`, for Azure. When you add or change an Azure key, ZeroSub sends it once to list the endpoint's models. While a proxy is set on a Pi account, or on Pi's own login, a check requests `api.anthropic.com/cdn-cgi/trace` through the proxy about every half hour to show the address Anthropic sees. To tell whether a folder is in use, ZeroSub reads the environment of your own processes for a matching home path. It does not store or send that text. The Bedrock form can ask an EC2 instance's metadata service for its region when the form opens.

- If your shared Claude settings set an `apiKeyHelper` or an API-key environment, every account uses that key instead of its subscription.
- Switching restarts the agent's session through `paseo agent reload`, which cannot authenticate on a password-protected daemon. There the switch takes effect the next time the session starts.
- Claude usage for an idle account retains its last reading between refreshes; background sign-in renewal covers stale resets and limited accounts, and Anthropic rate-limits the usage endpoint.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/zerosub).*
