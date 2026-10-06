Paseo Beads shows a read-only, dependency-aware work queue from Beads for each Paseo workspace. It adds a **Beads** Explorer panel and an **Open Beads** Command Center item. On Paseo 0.11 and newer it also adds a **Ready beads** sidebar row and a linkable screen for a single bead.

Active issues are sorted into **Ready frontier**, **In progress**, **Blocked** and **Other** lanes, ordered by priority, then most recent update, then ID. Rows show priority, ID, title, type, assignee, labels and relationship and comment counts. You can search by ID, title, assignee or label, and filter by **All**, **P0–P1** or **Assigned**. The detail view shows status, readiness, parent, description, acceptance criteria, design, notes, dependencies and dependents. The **Ready beads** row counts ready beads across the host's workspaces, and its popover lists the top ten grouped by workspace.

## Setup

- Paseo ^0.9.0, ^0.10.0 or ^0.11.0 with plugins enabled.
- The Beads `bd` CLI, version 1.0 or newer, on the daemon's `PATH`.
- A Beads project initialized in the workspace. The panel distinguishes a missing `bd`, an uninitialized project and an empty project.

## How it works

On the daemon host, the plugin runs `bd` with `--readonly` in the workspace directory: `bd list --json`, `bd list --ready --json` for readiness, `bd where --json` so workspaces sharing one database (such as git worktrees) count once, and `bd show` for a selected issue. It never reads or writes `.beads` storage directly and cannot create, edit, close or assign issues. The list refreshes every 10 seconds. The **Ready beads** row scans workspaces about every two minutes while the app is in the foreground and when its popover opens. It lists workspaces through the host connection.

## Limits

- `bd` calls time out after 10 seconds and accept at most 8 MiB of output. The panel shows a sanitized error and the details go to plugin logs.
- At most 500 issues are displayed per workspace, and the panel warns when counts may be incomplete. Search and filters apply only to the displayed snapshot.
- The **Ready beads** count covers the first 200 workspaces. If `bd` cannot report its database, worktrees of one project are counted separately.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-beads).*
