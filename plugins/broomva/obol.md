Lets you run more than one subscription behind the same provider (Claude or Codex) and switch which one your agents use without restarting the daemon, with a usage panel alongside. It requires Paseo 0.8.0-beta.1 or newer.

The plugin proposes one account for each `~/.claude` and `~/.codex` directory, and each sibling such as `~/.claude-work`, and binds nothing until you select it. A binding sets `CLAUDE_CONFIG_DIR` or `CODEX_HOME` for every provider session that opens, so the plugin does not rewrite credential files. Bind a provider from the Obol sidebar surface, or run `/obol <account-id>` to pin one agent. A binding applies to an agent, a workspace, or the provider default, most specific first.

Switching reloads the affected agents with `paseo agent reload`, except agents in the middle of a turn, which pick up the new account the next time their session opens. For Claude, a switch first copies the Claude conversation `.jsonl` files for the project directory from the old account's config directory into the selected account's directory, for all conversations in that project and not only the agent being switched. A copied file replaces the one in the target only when the source is newer. Codex history is not copied.

The usage panel shows Paseo's subscription windows and each agent's last-turn token counts. The windows are not per account, so for Claude they may reflect a different account than the bound one. The plugin keeps its account bindings and state in `obol/state.json` under the Paseo home.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/obol).*
