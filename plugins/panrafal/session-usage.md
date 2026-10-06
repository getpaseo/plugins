Session Usage adds a **Session usage** sidebar item and Command Center entry that report token use, tool calls, timing and estimated cost for your agent sessions on the selected host. It reads local session records, including archived sessions, subagents and sessions started outside Paseo, and joins them with Paseo's project, workspace and agent records.

The page has a sortable table that you can group by session, provider, project, workspace, label, model, effort, day, week or month. It also has provider comparison bars, a daily activity calendar and filters for provider, project, model, state, source and UTC dates. **Export CSV** writes every filtered row with raw numbers, and **Refresh** rescans. Allowance cards show Paseo's used percentage and reset time for each provider limit, with a token chart and a pace projection of when the allowance runs out. Providers without readable local records are listed with unknown usage.

## What it reads and writes

- **Claude** transcripts under `$CLAUDE_CONFIG_DIR` or `~/.claude`, and **Codex** rollout files under `$CODEX_HOME` or `~/.codex`, including archived ones. Providers in Paseo's `config.json` whose `env` sets `CLAUDE_CONFIG_DIR` or `CODEX_HOME` also have that directory scanned, as Claude or Codex records, and are attributed to that provider. Only the provider label and those two variables are read from provider settings.
- **OpenCode, Kilo, Devin CLI and Cursor** SQLite stores, opened read-only for local session and message records. Reading them needs the daemon's Node to provide `node:sqlite`, and otherwise the scan shows a warning.
- Paseo's own project, workspace, agent and config files under `$PASEO_HOME`, and Paseo's provider usage report for the allowance cards.
- The plugin writes only its own index, `$PASEO_HOME/plugin-data/session-usage/index.sqlite` (or the path in `PASEO_SESSION_USAGE_DB`), and keeps session metadata and counters in it. It does not modify transcripts or Paseo files. The scan starts when the plugin loads and the page refreshes every 30 seconds.
- Message text, tool arguments and results, and credentials stay in the daemon parser. The page receives metadata, counters, tool names and notices.
- No provider billing or pricing request is made. Costs are an estimate from a fixed API price table, not a bill or subscription meter, and unknown models stay unpriced.

Requires Paseo 0.7.2 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/session-usage).*
