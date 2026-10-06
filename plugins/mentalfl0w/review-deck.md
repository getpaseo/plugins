Review Deck is a review workspace for the changes an agent made in a Paseo workspace. You browse the Git diff file by file and hunk by hunk, leave comments on exact lines, and send the collected comments back to an agent in that workspace. It requires Paseo 0.10.0 or later.

## What it does

Open it from a workspace header button, an agent's composer pill, Command Center ("Open Review Deck"), or the `/review-deck` slash command. Each workspace gets one Review Deck tab, and opening it from an agent preselects that agent.

- **Review a scope**: the working tree, staged changes, a branch, or specific commits.
- **Comment**: select diff lines (click and Shift-click on desktop, two taps in compact layouts) or keep a hunk-level comment. Comments follow their code across later snapshots only when the match is unique, and stale or ambiguous ones wait for you to re-anchor them.
- **Queue and submit**: a project queue groups saved comments by workspace. Submitting sends one message per workspace to an agent in that workspace, which reports an outcome for each comment. Only comments the agent marks `COMPLETED` are removed, and stale, failed or unresolved ones stay queued, so check the resulting diff yourself. If a workspace has no eligible agent, its comments stay queued and no agent is created.
- **Reject changes**: reject a hunk, or revert all of a file's changes, by reversing the patch. This works only for working-tree and staged changes, and only if the workspace still matches the snapshot you reviewed, otherwise it is refused.
- **Mark files reviewed** and see badges in the workspace header and composer pill for pending comments and unread AI findings, with a status popover.
- **AI review**: explain a hunk, review a file, or review the whole target.
- **Verification Terminal**: when an AI finding includes an executable and arguments, the exact command is shown and runs in an interactive terminal in the workspace only after you confirm. The plugin shows the output and does not judge pass or fail.
- **Browser Preview**: set an HTTP(S) URL per project and host under More, then **Open Preview**. It uses Paseo's workspace browser, is available on Electron only, and does not fall back to an external browser.

The interface is in English or Chinese.

## AI review and your agents

Submitting comments and explaining a hunk message an existing agent in the workspace. AI review starts a separate child agent under the selected agent, in the same working directory, with the diff in its prompt, and archives it automatically when done. The reviewer uses your chosen provider, model and thinking level, in the first of these that the provider's mode list offers: a read-only or plan mode; an approval-gated "Ask" mode; or, for Codex only, the `auto` mode with its sandbox forced to read-only and approvals on request. If the provider offers none of these, the review is refused, and the provider's mode list at runtime decides which providers qualify. Review results appear in the agent's timeline as status rows with counts only, with no comment text, paths or patches.

## Settings

Settings → Plugins → Review Deck, stored per host:

- Interface language (Auto, 中文, English) and diff layout (Auto, Unified, Split).
- Reviewer strategy, provider, model and thinking level.
- AI review cache and token-usage display.
- The default depth preset: Economical, Balanced or Deep.

## What it reads and stores

- It runs Git commands in the workspace to read diffs, and `git apply --reverse` only when you reject or revert.
- It stores comments, submitted batches, AI review run metadata and an AI review result cache (entries expire 30 days after they were last used, up to 256 entries) as JSON files under `.paseo/review-deck/` in your user home directory, not under `PASEO_HOME`. A file with invalid JSON or an invalid schema produces an error and is not replaced with an empty one.
- It makes no network requests of its own. Diffs leave your machine only through the agents and providers you select.

## Limits

- Workspace activity and agent updates refresh a snapshot check, with a 60-second fallback.
- A running AI review resumes after a reload only if its child agent still matches and the run is under an hour old.
- Review Deck does not aggregate comments across hosts.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/review-deck).*
