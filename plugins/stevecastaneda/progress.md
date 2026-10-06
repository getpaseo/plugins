Progress gives each worktree a live dashboard for multi-ticket jobs. Agents record tickets, stuck work, questions and deliverables with a `paseo-progress` command, and the **Progress** panel in Explorer shows them, with a pill above the message box for open questions. Nothing updates unless the agent runs the command, so agents need the plugin's skill. It requires Paseo 0.9.0 or newer and Node.js 22.18 or newer on the daemon host.

**Setup.** The panel shows the exact destination before you press each setup button, and the installers run only after you press them. Both install from files carried in the plugin, with no download, and leave existing ordinary files and unrelated links in place.

- **Install command** writes `~/.local/bin/paseo-progress` on the daemon host.
- **Install skill** links the plugin's `paseo-progress` skill into `~/.agents/skills`, `~/.claude/skills` and `~/.codex/skills`.

**Data.** Progress is kept per worktree under `~/.local/state/paseo-progress/` on the daemon host, outside the repo. Saving runs into the repo is opt-in: after you pick a folder, each run is also written there and the choice is stored in the repo's local git config. Images and text deliverables preview inside Paseo, and other recorded files inside the worktree can be opened with the default app on the daemon host.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/progress).*
