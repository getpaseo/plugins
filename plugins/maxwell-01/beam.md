Mirrors a workspace's files onto your main checkout, so a dev server already running there, with live reload, shows the workspace's changes without you switching branches. It requires Paseo 0.8.0 or newer, and the workspace and main checkout must belong to the same git repository.

While a beam is active, the main checkout is rewritten to match the workspace after each change, including uncommitted and untracked files. Git-ignored files such as `.env` and `node_modules` are not copied. Only one beam can be active at a time. Edits you make directly in the main checkout while beaming are overwritten on the next sync and discarded when you beam out, which restores the checkout from a snapshot taken at the start. Unloading the plugin or stopping Paseo stops the syncing but does not restore the checkout, so it stays mirrored until you beam out.

The plugin runs `git` on the daemon host and keeps its state in your home directory and the main checkout's `.git` directory.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/beam).*
