Branch Garden shows the local Git branches and worktrees of your Paseo projects in one sidebar page, so you can review which branches look like cleanup candidates. It never checks out, resets, or deletes branches, prunes worktrees, or writes Git configuration. To delete a branch, use Git yourself.

## What it reads

It lists Paseo's projects and workspaces on the selected host, then runs read-only Git commands (`rev-parse`, `symbolic-ref`, `for-each-ref`, `worktree list`, `status`) in each repository on the daemon machine. Git must be installed there. The plugin has no settings and makes no network requests of its own. Cleanup labels are advice only, and the page is a snapshot, so refresh after external Git changes.

## Limits

- Release v0.1.0-rc.3 targets Paseo 0.8.0. Its own notes describe a user-run Paseo 0.8 check, mainly on Windows, with only automated checks on macOS and Linux.

Requires Paseo 0.8.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/branch-garden).*
