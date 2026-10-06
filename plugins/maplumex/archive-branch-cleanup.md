Deletes the local git branch of a Paseo-created worktree workspace when you archive it, since Paseo removes the worktree but leaves the branch behind. It requires Paseo 0.8.0 or newer, `git` on the daemon host, and plugins enabled on the daemon.

This runs automatically on every archive, with no confirmation and no settings. The branch is force-deleted with `git branch -D`, and the plugin does not check whether it was merged or pushed, so unmerged or unpushed commits on it are lost. It skips common mainline and release branches and workspaces Paseo did not create as worktrees, and it never deletes remote branches. Afterwards it runs `git fetch --prune origin`, which contacts the remote using the daemon host's git credentials.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/archive-branch-cleanup).*
