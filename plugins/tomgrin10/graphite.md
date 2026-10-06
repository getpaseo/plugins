Graphite shows the Graphite stack for each workspace and says whether each pull request needs action, is ready to merge, is waiting, or is done. The stack comes from the Graphite CLI in the workspace, and GitHub adds reviews, unresolved threads, checks and mergeability to those branches. It does not infer stacks from pull request base branches.

It appears as a **Graphite PRs** sidebar inbox across active workspaces, a stack button in the workspace header, a composer pill, and a `/pr-stack` command. The plugin offers no branch or pull request actions. **Fix All** creates a separate agent in the workspace, using the provider configuration of the workspace's latest agent, and sends it a prompt to fix the actionable problems in the stack. It needs an agent already opened in that workspace.

Setup:

- `git` and the Graphite CLI (`gt`) on the daemon host, with Graphite initialized in the repository.
- An authenticated GitHub CLI (`gh`) for live pull request status.
- Requires Paseo 0.8 or newer.

What it runs: on the daemon host, in the workspace directory, it runs `git` to read the current branch and origin URL, `gt` to read the stack, and `gh api graphql` once per submitted pull request. These commands receive a copy of the daemon's environment.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-graphite).*
