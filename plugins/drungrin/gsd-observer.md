GSD Observer shows the planning state of a GSD project in a workspace as read-only tabs. It reads the workspace's `.planning` folder and does not run GSD, create worktrees, merge, or write to any planning file.

Open **Open GSD Board** from the workspace or Explorer panel launcher. The board has tabs for Overview (STATE, roadmap progress, requirements), Plans (current-milestone phases with plans, summaries and phase checks), Context (decisions recorded in each phase's CONTEXT), Validation, Verification, UAT, TODOs (pending, backlog and completed folders), Parking Lot (999.x roadmap backlog entries) and Debug (active and resolved debug sessions). Statuses are shown as recorded, and sources that disagree are flagged instead of resolved.

## Setup

Nothing to configure. The workspace needs GSD planning artifacts under `.planning`, and the plugin requires Paseo 0.9.0 or later.

## What it reads

- The server side reads a fixed allowlist of files under the workspace's real `.planning` directory: root documents, phase files such as CONTEXT, PLAN, SUMMARY, VERIFICATION, UAT, REVIEW and the optional phase checks, TODO folders and debug sessions. Symlinks, files that change while being read, and anything resolving outside `.planning` are refused and shown as warnings.
- Each file is capped at 256 KiB, a snapshot at 8 MiB of planning files plus 3 MiB of debug sessions. Oversized, malformed or unreadable files become warnings or unavailable evidence.
- The client receives validated labels, counts, warnings and evidence categories. The plugin makes no network requests and has no terminal, agent or write action.

## Refresh behavior

A file watcher (chokidar) on the planning folders marks the board as potentially stale when something changes. The board updates only when you refresh it. The server keeps at most eight workspaces watched and drops ones unused for a minute.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-gsd-observer).*
