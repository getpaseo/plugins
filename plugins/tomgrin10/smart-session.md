Smart Session lets Claude Code agents in Paseo check how full their context is, save task state and compact themselves, and it records context and Claude plan usage over time. It requires Paseo 0.8.0 or later and is aimed at Claude Code agents.

## What it does

**Agent-requested compaction.** Agents get MCP tools:

| Tool | What it does |
| --- | --- |
| `context_status` | Shows context usage, filling rate and thresholds |
| `checkpoint` | Writes durable task state for the session |
| `request_compaction` | Queues a `/compact`, and chooses whether and how to continue afterwards |
| `defer_compaction` | Defers a compaction request and records why |
| `budget_status` | Shows plan usage, burn rate and reset times |

The plugin never compacts a session on its own. When a session crosses the compact threshold at the end of a turn, a hook asks the agent whether to compact, and the agent can compact, defer with a reason or keep working. A request is delivered only when the agent is idle and its state file is current. After compaction the agent continues from its saved state by default, or finishes, or follows a message the agent wrote. A `/compact` that you type never gets a plugin follow-up.

A composer pill shows **Smart Compact on** or **off** for the current session, and is hidden when Smart Compact is disabled globally.

**Usage history.** The plugin keeps a local history of context-window usage per session, Claude plan usage with burn rate and reset times, token spend by model, workspace and main agent versus subagent, and compaction requests with before and after sizes. It shows this as charts in the plugin's screen.

## What it changes on your machine

When the plugin loads, and again when you change the **Register the hooks with Claude Code** setting or open its install status, it reconciles Claude Code configuration on the daemon host:

- It adds four hook entries to Claude Code's `settings.json` (`PostToolUse`, `Stop`, `PostCompact` and `SessionStart` for compact), each running a script from this plugin with `node`. Entries pointing at other scripts are left alone, and one backup of the file is kept the first time it is modified. Turning off **Register the hooks with Claude Code** removes the entries it added.
- It registers a user-scope MCP server named `smart-session` by running `claude mcp add-json` (and `claude mcp remove` to replace an outdated entry). If the `claude` CLI is not on the daemon's PATH, the MCP server is not registered and the agent tools are missing until you add it by hand.

## What it reads and sends

- **Claude credentials and Anthropic.** While the plugin is loaded it checks once a minute and, whenever at least three minutes have passed since its last attempt (successful or not), tries to read your Claude Code OAuth access token. Only when it finds one does it request `https://api.anthropic.com/api/oauth/usage` with it to get live plan usage; with no credentials nothing is sent. It reads the token from Claude Code's `.credentials.json`, or on macOS from the keychain entry "Claude Code-credentials". It only reads the token, and does not store or log it. Without credentials, or on an authorization failure, it relies on the Paseo daemon's usage reading (polled each minute, and cached by Paseo for up to five minutes). It reads Claude Code's cached usage in `~/.claude.json` when nothing has been recorded yet, or when the newest recorded reading is at least 15 minutes old, and in both cases only if that file has changed since it was last read, and it discards a cached reading that is older than what it already has.
- **Transcripts.** It scans Claude Code transcripts under `~/.claude/projects` and subagent output under `/tmp/claude-<uid>` to attribute token spend, reading new lines incrementally.
- **Paseo daemon.** It talks to the local Paseo daemon to list agents and deliver compaction requests. If the daemon needs a password, the plugin takes it from `PASEO_PASSWORD`, then from the file named by `PASEO_PASSWORD_FILE`, then from a daemon password file in a default location, and uses it only to connect.

`CLAUDE_HOME` and `CLAUDE_CONFIG_DIR` change which Claude Code directories it reads. Its own data stays under `$PASEO_HOME/plugin-data/smart-session/`, which holds the usage and context logs, compaction records, spend index, settings, enrolment and one `state/<agentId>.md` task-state file per agent.

## Settings

| Setting | Default | Effect |
| --- | --- | --- |
| Smart Compact | On | Enables context notices and agent-requested compaction |
| Large-window compact threshold | 30% | When to ask, on windows of 400k tokens or more |
| Small-window compact threshold | 85% | When to ask, on smaller windows |
| Enrol sessions automatically | On | Enrols a session after it writes task state |
| Show the pill on every agent | On | Shows the Smart Compact control in the composer |
| Register the hooks with Claude Code | On | Keeps the hooks installed in Claude Code's settings |

Thresholds accept whole percentages from 1 to 99.

## Limits

`request_compaction` refuses when the state file is missing or stale, and the agent can checkpoint and request again. Usage logs are append-only, and a damaged line is skipped.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/smart-session).*
