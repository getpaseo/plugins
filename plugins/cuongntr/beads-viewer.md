Beads Viewer is a read-only dashboard for a workspace's [Beads](https://github.com/steveyegian/beads) issues. It shows how far each parent issue has progressed, what is in progress, what can start now, how labels spread across open work, and the longest remaining chain of dependencies. It runs no command that creates, claims, closes, or edits an issue.

It adds a **Beads Viewer** panel (workspace tab and Explorer), Command Center items **Open Beads Viewer** and **Refresh Beads Viewer**, the slash commands `/beads` and `/bead <issue-id>`, and a **Beads issue** source in the composer's attachment picker.

## What you need

Two command-line tools on the daemon machine's `PATH`: [`bv`](https://github.com/Dicklesworthstone/beads_viewer) (verified against v0.25.0), and the tracker your project uses, `br` or `bd`. Without `bv` the panel reports that it is missing. Without the tracker command, issue detail, issue types, and assignees are unavailable and everything else still works. The workspace must have a `.beads` folder.

## What the panel shows

- **Overview:** progress per parent issue, work in progress, held and ready-now work, the project's labels over open work, and the critical dependency chain.
- **Board:** one column per work state: Ready, Waiting, In progress, Held, Other status, and Done (hidden unless you choose **Show done**). Filter by parent or label. Each column shows at most 60 cards and notes how many more there are. A project over 2,000 issues drops closed issues first.
- **Plan:** `bv`'s parallel execution tracks.
- **Risks:** stuck and parked work, alerts by severity, and the issues that unblock the most others.
- **Search and issue detail:** issue text rendered as Markdown. HTML, images, and tables are not rendered, and links are shown as text.

Ranking, tracks, alerts, and search relevance come from `bv`. The plugin adds the work-state grouping and the dependency chain. A custom status from a project's `.beads/policy.yaml` is shown as **Other status**, not guessed.

## What it reads and runs

It runs only a fixed list of read-only commands, without a shell, in the workspace's own directory: `bv --version` and `bv --robot-triage`, `--robot-plan`, `--robot-alerts`, `--robot-graph`, and `--robot-search`, plus the tracker's `list` and `show --json`. Subprocesses have timeouts and output limits. The panel polls for changes to the project's Beads event journal while it is open.

It reads `.beads/metadata.json` to match the tracker to the database `bv` chose, and takes issue data only from command output. It does not parse or write Beads database files. `bv` may refresh its own compatibility export when it loads a `bd` or Dolt workspace, so calls are serialized per workspace. Results are cached for 15 seconds, and tracker identity for 2 minutes. The plugin makes no network requests of its own.

## Limits

- If the tracker or database cannot be identified with certainty, issue detail is turned off instead of guessed.
- Attachment search has no workspace context. It scans recently active workspaces, searches at most 4 that use Beads, and returns at most 8 issues.
- Statuses and alert levels it does not recognize show without special styling.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/beads-viewer).*
