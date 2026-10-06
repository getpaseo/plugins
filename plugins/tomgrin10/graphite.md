Graphite shows the real Graphite stack for each workspace and says whether each pull request needs action, is ready to merge, is waiting, or is done.

The stack comes from the Graphite CLI in the workspace. GitHub only adds reviews, unresolved threads, checks and mergeability to the branches Graphite reports, and the plugin does not infer stack membership from pull request base branches. Each pull request is a compact row with its action state, `resolved/total` review threads, check count and a Graphite link. GitHub links and comment bodies are not shown.

## Where it appears

- A **Graphite PRs** sidebar item and Command Center entry give an inbox across active workspaces, grouped into needs-attention, approved, waiting and completed.
- A `Stack N` or `Stack N · Fix M` button in the workspace header, and a composer pill beside Tasks and Subagents.
- `/pr-stack` in an agent composer opens the Explorer panel.
- **Fix All** creates a separate agent in the workspace, using the provider configuration of the workspace's latest agent, and sends it a prompt to fix the actionable issues in the stack. If review feedback is present, the prompt starts with your existing `/fix-pr` workflow. The plugin does not register or intercept `/fix-pr`. Fix All needs an agent already opened in the workspace.

## Setup

- Paseo 0.8 or newer.
- `git` and the Graphite CLI (`gt`) on the daemon host, with Graphite initialized in the repository.
- An authenticated GitHub CLI (`gh`) for live pull request status.

## What it runs

On the daemon host it runs `git` (current branch, origin URL), `gt` (trunk, stack log, branch info, always non-interactive) and `gh api graphql` (one query per submitted pull request) in the workspace directory, passing a copy of the daemon's environment with pager and color overrides. It finds the binaries by searching `PATH`. The plugin offers no branch or pull request actions. **Fix All** creates an agent in the workspace.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-graphite).*
