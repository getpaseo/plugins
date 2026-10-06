Beads Viewer is a read-only dashboard for a workspace's [Beads](https://github.com/steveyegian/beads) issues. It shows progress per parent issue, work in progress, what can start now, risks, and the longest remaining dependency chain, and lets you attach an issue to a prompt. It runs no command that creates, claims, closes, or edits an issue.

## Setup

Two command-line tools must be on the daemon machine's `PATH`: [`bv`](https://github.com/Dicklesworthstone/beads_viewer) (verified against v0.25.0) and the tracker your project uses, `br` or `bd`. The workspace must have a `.beads` folder. Without `bv` the panel reports it as missing. Without the tracker command, issue detail is unavailable and the rest still works.

## What it reads and runs

It runs a fixed list of read-only `bv` and tracker commands, without a shell, in the workspace's own directory, and reads `.beads/metadata.json` to match the tracker to the database `bv` chose. It does not parse or write Beads database files, though `bv` itself may refresh its own compatibility export when it loads a `bd` or Dolt workspace. The plugin makes no network requests of its own.

## Limits

- If the tracker or database cannot be identified with certainty, issue detail is turned off instead of guessed.
- A project over 2,000 issues drops closed issues first.
- Searching issues to attach to a prompt scans recently active workspaces, at most 4 that use Beads, and returns at most 8 issues.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/beads-viewer).*
