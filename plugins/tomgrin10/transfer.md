Transfer copies or moves workspaces between hosts with Git history, local changes, untracked files, and saved Claude or Codex conversations. Press **Transfer** at the top right of a workspace, choose a receiving host and a new directory, and review the preview before starting. The sidebar is hidden by default; enable it in plugin settings or use Command Center for the full screen and incoming transfers.

Both hosts need Paseo 0.11.0 or newer, Node 22 or newer, Git, and Linux, macOS, or WSL. The receiving host also needs a running Paseo daemon, SSH access, and its own provider CLIs and credentials. Only the initiating host needs the plugin. Trust new SSH host keys and stop running agents before transferring.

Transfers use SSH and existing Paseo authentication. Provider credentials, MCP settings, launch settings, and Git-ignored files stay behind. **Copy** keeps the source; **Move** archives it through Paseo after verification, which can remove a managed source worktree. Move refuses worktrees containing ignored files. Copies are independent checkouts.

Occupied destinations, changed previews, unsafe paths, unsupported conversations, and submodules are refused. Transfers are limited to 128 MiB and 20,000 files. Closing the popup does not stop a transfer; registered partial transfers are kept for recovery. The screenshot uses fixture workspace and host data.
