Diff Review adds a workspace panel for reviewing unstaged and untracked changes in a Git repository and its dirty submodules. Browse diffs, expand context, leave file or line comments, and mark files viewed or ignored. Review progress, comments, typography and the editable prompt template are shared by clients connected to the same daemon.

Requires Paseo 0.11.0 or later and Git on the daemon host. Open **Diff Review** from the workspace panels or **Open Diff Review** in Command Center. **Settings → Diff Review** controls the prompt and diff typography. Opening files in an editor requires host support.

**Send** delivers your comments and optional general note to a selected workspace agent, or creates an agent using an available provider. Viewed and ignored file lists are optional and disabled by default. After sending, viewed files without comments are staged automatically. Staging uses the current working-tree contents, so check for edits made since you reviewed a file.

**Discard changes** immediately restores a tracked file's unstaged changes from the index or deletes an untracked file. It does not offer a separate confirmation or undo. Staged changes are left intact. Submodule placeholder rows cannot be staged or discarded.

The plugin reads repository status, diffs, file contents and agent metadata through the daemon, and runs local Git commands for inspection, staging and discarding. Comments sent to an agent enter that agent's normal conversation and provider workflow. The plugin has no separate external service or account setup. Like other trusted local plugins, it runs with the daemon user's access.

Binary files and diffs larger than 1 MiB are not displayed. The panel reviews unstaged work rather than the staged diff. Review progress is attached to paths, so a viewed mark does not certify later edits to that path.
