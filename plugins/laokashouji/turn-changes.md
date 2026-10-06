Turn Changes summarizes the files an agent changed in each turn. After a turn that edited files, the conversation gets a card with the changed files and line counts, and opening it shows that turn's diff in the side panel. From there you can edit a file in place or undo the whole turn. The interface is in Chinese only, and the plugin requires Paseo 0.8.x (0.8.0 or later, below 0.9.0). The author has not tested Android or iOS.

## Where the changes come from

The plugin sums the structured edit and write records that the agent's provider reports. Changes made by shell commands without an edit record are missed. For Codex it also reads local Codex session logs, under `CODEX_HOME` or `~/.codex`, to fill in files the records leave out. Native Codex turn diffs are optional and need a patch to Paseo's own source that you apply and build yourself. Nothing applies it automatically, and without it Codex uses the edit records.

## Undo and stored data

Undo is manual and covers a whole turn. It is refused when a file changed afterward, when records are incomplete, when a file is outside the working directory or inside `.git`, or when an agent is running in that directory. It does not restore renames, binary files, symlinks or permission-only changes, and it does not touch git staging, commits or branches.

Turn records hold the before and after text of changed files. They are saved on the daemon host under the Paseo home's `plugin-data/turn-changes` folder (or `PASEO_TURN_CHANGES_HOME`) with owner-only permissions, are never cleaned up automatically, and stay after the plugin is removed. The plugin makes no network requests.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/turn-changes).*
