Beads board shows the issues in a project's [beads](https://github.com/steveyegian/beads) database as a kanban board inside Paseo, and lets you create and edit them. It works on desktop, browser, and mobile, and it adds a **Beads board** sidebar item (with a host picker), a workspace tab that opens on that workspace's project, and a **Beads** source in the composer's attachment picker for attaching an issue to a prompt.

## What you need

The beads `bd` command must be on the `PATH` of the daemon machine. If it lives elsewhere, set `PASEO_BEADS_BD_BIN` in the daemon's environment. A missing binary shows as an error on the board and in the plugin log. Each daemon host serves its own projects.

## What you can do

- **Board:** columns for Open, In Progress, In Review, and Closed (Closed is off by default). `blocked`, `deferred`, and `pinned` beads show as badges on Open, `hooked` shows on In Progress, and `tombstone` beads are hidden. Beads with a parent are grouped under it with a progress bar. A bead counts as blocked when a dependency is still open or its status is `blocked`.
- **Detail view:** full text, relations, and comments. Move a bead between columns with the status buttons there (there is no drag and drop).
- **Changes:** create a bead in any discovered project, edit its title, description, notes, priority, and assignee, close and reopen it, and add comments.
- **Settings:** under **Settings → Beads board** you can add extra project paths, set the refresh interval, and choose whether the Closed column shows. They apply to the host and are shared by every client connected to it.

## What it reads and runs

The plugin finds projects by listing Paseo's projects and workspaces, then looking for an initialized `.beads` database in each directory or up to four parent levels above it. It also checks any paths you add in settings. Worktrees that share a database are shown once.

Every operation runs `bd` on the daemon machine as the daemon's user, without a shell: `status`, `count`, `where`, `list`, `show`, and `comments` to read, and `create`, `update`, `close`, `reopen`, and `comment` to change data. Moving a bead, editing a field, or commenting writes to that project's real beads database right away, and the daemon user can reach any database that account can. The plugin makes no network requests of its own.

## Limits

- The board loads at most 5,000 beads, and a larger database shows a truncated board.
- Lists are read in brief form and long text loads when you open a bead.
- A database that renamed its statuses has its beads placed by whatever the current statuses map to.
- It covers the board only, with no pull request, worktree, or memory panels.
- Releases are 0.x, and a minor version can contain breaking changes.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/beads-board).*
