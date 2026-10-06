Mirrors a workspace's working tree onto your main checkout on disk, so a dev server already running there with live reload shows the workspace's changes without you switching branches. It requires Paseo 0.8.0 or newer, and the workspace and its main checkout must be worktrees of the same git repository.

Beam in and out from a button in the workspace header or from the Beam panel. While a beam is active, the plugin watches the workspace and, after each change, moves the main checkout's branch to the workspace's `HEAD` and rewrites its files and index to match the workspace, including uncommitted and untracked files. Git-ignored files such as `.env` and `node_modules` are not copied and are left alone. Only one beam can be active at a time, and the workspace title gets a lightning prefix while it runs.

Before the first sync the plugin saves a snapshot of the main checkout in git, and beam out restores from it. Edits you make directly in the main checkout while beaming are overwritten on the next sync and discarded at beam out. Unloading the plugin or stopping Paseo stops the watcher but does not restore the checkout, so the main checkout stays mirrored until you beam out.

The plugin runs `git` on the daemon host and keeps its state in `~/.paseo-beam-active.json` and inside the main checkout's `.git` directory.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/beam).*
