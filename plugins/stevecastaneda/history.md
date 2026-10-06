History adds a **History** pill to the message composer that shows the saved session records behind a chat, which can differ from what Paseo displays. It requires Paseo 0.9.0 or newer and supports Codex, Claude Code and OpenCode chats. Other providers get an explanation instead of a viewer.

The records are read on the daemon host, read-only:

- Codex logs come from `CODEX_HOME` (default `~/.codex`), including archived sessions.
- Claude Code logs come from `CLAUDE_CONFIG_DIR` (default `~/.claude`).
- OpenCode history comes from running `opencode export --pure`, so `opencode` must be on the daemon's `PATH`.

The plugin never modifies these files and makes no network requests of its own, and images in messages appear as labeled links instead of loading.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/history).*
