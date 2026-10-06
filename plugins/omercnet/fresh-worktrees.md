Fresh Worktrees brings the local base branch up to date before Paseo creates a branch-off worktree, so new work starts from the latest remote code instead of a stale `main`.

## How it works

When a branch-off workspace is requested, the plugin finds the source repository from the request path or Paseo project and runs `git fetch --prune` against the relevant remote, without interactive prompts. If the base is implicit or a local branch such as `main`, that branch is checked out, and the source checkout is clean, it runs `git merge --ff-only` to the remote-tracking branch. The workspace request itself is not changed, so Paseo forks from the updated local branch.

It skips the update, warns, and lets workspace creation continue from the existing local base when the source checkout has uncommitted changes, the fetch fails, or the update would not be a fast-forward. Explicit remote bases are fetched but no local branch is changed. Explicit checkout and change-request workspaces, and repositories without remotes, are left alone. Concurrent requests for the same target share one refresh.

## Behind indicator

Every five minutes the plugin rechecks active worktrees and shows `Behind · N` in the workspace header when the worktree's `HEAD` is behind the remote-tracking ref of the source checkout's current branch. Selecting the indicator rechecks it. On Paseo 0.11 and later, a **Behind source branch** footer row lists the affected workspaces and offers **Refresh all**, which fast-forwards each clean source checkout and skips dirty or diverged ones. Worktree branches are never modified. Paseo 0.9 and 0.10 do not get the footer row.

## Requirements and access

- Paseo ^0.9.0, ^0.10.0 or ^0.11.0, and `git` on the daemon host.
- The plugin runs `git` on the daemon host with a copy of the daemon's environment, and contacts the repository's remote when it fetches.
- It has no settings to fill in.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/fresh-worktrees).*
