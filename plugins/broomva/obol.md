Lets you use more than one Claude or Codex account behind the same provider and switch which one your agents use without restarting the daemon. It requires Paseo 0.8.0-beta.1 or newer, and it is meant for setups with several config directories, such as `~/.claude` and `~/.claude-work`. It proposes an account for each directory it finds and binds nothing until you choose.

You can bind an account to a single agent, a workspace, or the provider default. Switching reloads the affected agents, except those in the middle of a turn, which pick up the new account the next time their session opens.

For Claude, a switch copies the project's Claude conversation history files (all `.jsonl` files for the whole project, not only the agent being switched) from the old account's config directory into the selected account's. A copied file replaces the one in the target only when the source is newer. Codex history is not copied. This is a write into another account's directory.

A usage panel shows Paseo's subscription windows, which are not per account, so for Claude they may reflect a different account than the bound one. The plugin keeps its account bindings and state in `obol/state.json` under the Paseo home.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/obol).*
