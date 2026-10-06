Deletes the local git branch of a Paseo-created worktree workspace when you archive that workspace. Paseo removes the worktree directory on archive but leaves the branch, so branches pile up over time. It requires Paseo 0.8.0 or newer and `git` on the daemon host's PATH, and plugins must be enabled on the daemon.

The cleanup runs automatically on every archive, with no confirmation and no settings. For a workspace that Paseo created as a worktree and that has a recorded branch, the plugin runs `git branch -D <branch>` in the project's main repository, retrying for up to 30 seconds while the daemon finishes removing the worktree. It then runs `git fetch --prune origin` in that repository, which contacts the `origin` remote with the daemon host's git credentials and drops remote-tracking branches that no longer exist there. A failed fetch is logged and does not undo the deletion.

The deletion uses `-D`, so the branch is removed even with unmerged commits, and the plugin does not check whether it was pushed or merged. Unpushed work on that branch is lost once the workspace is archived. The plugin never deletes remote branches. It skips `main`, `master`, `trunk`, `develop`, `dev`, `production`, `prod`, and branches starting with `release/` or `release-`, and skips workspaces Paseo did not create as worktrees.

The branch name and repository path come from the daemon's workspace records in the Paseo home directory.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/archive-branch-cleanup).*
