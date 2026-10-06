PR Radar adds a screen and a sidebar row that list the open pull requests linked to your Paseo workspaces, sorted by what needs your attention. It combines each workspace's pull request status from Paseo (checks, review state, mergeability) with your GitHub identity, so it can tell your own pull requests from ones where you are asked to review.

Rows fall into four groups:

- **Needs you**: your pull requests with blockers, and review requests whose checks have finished.
- **Being handled**: actionable work that has an active Paseo agent.
- **Waiting externally**: running checks, pending reviews, repository requirements, and work by external authors.
- **Ready**: your pull requests that are mergeable with settled checks and reviews.

Rows are labeled `YOURS`, `REVIEW` or `EXTERNAL`. You can filter by 7, 30 or 90 days of activity. On Paseo 0.11 the sidebar row shows a "needs you" count that opens a list of those pull requests; a trailing `+` means the count may be incomplete. If the GitHub lookup fails, PR Radar does not mark rows as needing you.

## Setup

Paseo 0.9, 0.10 or 0.11. The GitHub CLI (`gh`) must be installed and authenticated on the machine running the Paseo daemon.

## Reads and sends

- Reads workspaces and agents from your Paseo host, including each workspace's linked pull request.
- Runs `gh` on the daemon host: `gh api user` to get your login, `gh search prs` for your authored and review-requested open pull requests, and `gh api graphql` for review decision, mergeability and check status. These calls go to GitHub with your `gh` credentials, and the daemon's environment is passed to `gh`.
- Stores a record of each pull request's last-seen checks, review and merge state in `.paseo/plugin-data/pr-radar/inbox-state.json` under the daemon user's home directory (a fixed location that does not follow a custom `PASEO_HOME`), so it can show what changed since you last marked updates as seen.
- On "needs you" rows, an action sends a prompt to an existing agent in the linked workspace, or starts a new agent there using the agent profile named "model router" (or your first configured profile). When no workspace exists but a local project does, it creates a worktree checkout of the pull request first. The prompt asks the agent to review the pull request, or to fix its blocker and report back, and says not to merge.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/pr-radar).*
