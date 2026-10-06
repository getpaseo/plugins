Branch Garden shows the local Git branches and worktrees of your Paseo projects in one sidebar page, so you can review which branches look like cleanup candidates. It runs only the read-only Git commands listed below, so it does not check out, reset, or delete branches, prune worktrees, or write Git configuration.

## What it shows

Pick a host and press refresh. Each registered Git project lists its active workspaces, whether each worktree has uncommitted changes, and its branches. Use **All**, **Cleanup candidates**, or **Needs review** to filter. Expand **Kept branches** to see branches held back because they are the default branch, checked out in a worktree, or unmerged with an existing upstream. These labels are advice only. Projects that are not Git repositories are skipped, and detached HEAD, missing repositories, and scan failures are shown as such.

## What it reads

It lists Paseo's projects and workspaces on the selected host, then runs Git in each repository on the daemon machine, with a 15-second timeout per command. The commands are read-only: `rev-parse`, `symbolic-ref`, `for-each-ref`, `worktree list`, and `status`, run with optional locks disabled. Git must be installed on the daemon host. The plugin has no settings and makes no network requests of its own.

The page is a snapshot. It can go stale if something else changes the repository, so refresh after external Git changes.

## Limits

- Release v0.1.0-rc.3 targets Paseo 0.8.0. The plugin's own notes describe a user-run Paseo 0.8 check rather than a full certification. Windows is the platform it was mainly run on, and macOS and Linux have automated checks only.
- The page does not remove branches. To delete one, use Git yourself.

Requires Paseo 0.8.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/branch-garden).*
