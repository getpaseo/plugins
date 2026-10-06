Beads board shows the issues in a project's [beads](https://github.com/steveyegian/beads) database as a kanban board inside Paseo, and lets you create, edit, close, reopen, and comment on them. It adds a sidebar item, a workspace tab, and a **Beads** source in the composer's attachment picker.

## Setup

The beads `bd` command must be on the `PATH` of the daemon machine, or its location set in `PASEO_BEADS_BD_BIN` in the daemon's environment. Each daemon host serves its own projects.

## What it reads and changes

The plugin finds projects from Paseo's projects and workspaces by looking for an initialized `.beads` database in each directory or up to four parent levels above it, plus any paths you add in settings. Every operation runs `bd` on the daemon machine as the daemon's user, without a shell. Moving a bead, editing a field, or commenting writes to that project's real beads database immediately, and the daemon user can reach any database that account can. Settings (extra paths, refresh interval, whether Closed shows) apply to the host and are shared by every connected client. The plugin makes no network requests of its own.

## Limits

- The board loads at most 5,000 beads, and a larger database shows a truncated board.
- Board only, with no pull request, worktree, or memory panels.
- Releases are 0.x, and a minor version can contain breaking changes.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/beads-board).*
