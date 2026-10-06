Turn Changes summarizes the file changes an agent made in each turn. After a turn that edited files, the conversation gets an "edited N files" card with added and removed line counts and the file list. Press a file or **Review** to open the turn's diff in the right-hand panel, and **Undo** to restore the files to their state before the turn. The interface is in Chinese, with no other language available. It needs Paseo 0.8.x, because the manifest requires 0.8.0 or later and below 0.9.0.

The review panel shows a diff with line numbers and syntax highlighting, previous and next file buttons, and a file tree when the panel is wide enough. **Open source file** edits the current file in the same panel (UTF-8 text up to 1 MiB, with a version check on save). A Turn Changes panel in the workspace lists the current agent's history, and Command Center items open it and the source settings.

## Where the changes come from

- By default the plugin sums the agent's structured file edit and write records for the turn, for every provider. It cannot see files that an agent writes through shell commands without an edit record.
- For Codex it also reads the local Codex session logs under `$CODEX_HOME` or `~/.codex` (following a custom provider's `extends` and `CODEX_HOME`) to add new files and multi-file edits. Settings choose `auto`, `native` or `edits` per provider. Native Codex turn diffs need a patch to Paseo's own source that you apply and build yourself. It is not applied automatically, and without it Codex uses the edit records.

## Undo and stored data

- Undo is refused when any file in the turn was changed afterward, when records are incomplete, when a file is outside the working directory or inside `.git`, or when an agent is running in that directory. It does not restore renames, binary files, symlinks or permission-only changes, and it does not touch git staging, commits or branches.
- Before restoring, the plugin checks every file's content and permissions, then replaces files one at a time and tries to roll back if one fails.
- Turn records contain the before and after text of changed files. They are saved on the daemon host in `plugin-data/turn-changes` under the Paseo home directory (or `PASEO_TURN_CHANGES_HOME`) with owner-only permissions, are never cleaned up automatically, and stay after the plugin is removed.
- Limits are 2 MiB per file snapshot, 200 files and 24 MiB per turn. The plugin makes no network requests.
- Android and iOS clients have not been tested by the author, and conversation cards are not restored when an archived session is reopened, although the history panel still shows the records.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/turn-changes).*
