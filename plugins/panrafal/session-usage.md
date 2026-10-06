Session Usage reports token use, tool calls, timing and estimated cost for the agent sessions on the host you are viewing. It joins them with Paseo's project, workspace and agent records. Allowance cards show the limits Paseo reports for each provider.

## Access

- The daemon reads local Claude and Codex transcripts, and the OpenCode, Kilo, Devin CLI and Cursor SQLite stores, which it opens read-only. Reading those stores needs the daemon's Node to provide `node:sqlite`. It also reads Paseo's project, workspace, agent and config files. Providers in Paseo's config that set `CLAUDE_CONFIG_DIR` or `CODEX_HOME` have those directories scanned too.
- The plugin writes only its own index, `index.sqlite` under the Paseo home's `plugin-data/session-usage` folder (or the path in `PASEO_SESSION_USAGE_DB`), which holds session metadata and counters. It does not change transcripts or Paseo files.
- Message text, tool arguments and results, and credentials stay in the daemon's parser. The app receives metadata and counters, and the data is not sent anywhere else.
- It makes no billing or pricing requests. Costs are estimates from a fixed API price table, not a bill or subscription meter, and models it has no price for stay unpriced.

Providers without readable local records appear with unknown usage. Requires Paseo 0.7.2 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/session-usage).*
