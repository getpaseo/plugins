Adds a Git Tree tab to a workspace that shows the branch history as a commit graph, with commit diffs and search, and lets you change the repository from it. It requires Paseo 0.8.0 or newer.

Everything runs as `git` on the daemon host in the workspace directory, so the operations include checkout, merge, rebase, cherry-pick, pull, and push, and also destructive ones such as force push, hard reset, and branch deletion, including on the remote. Rebase, force push, delete, revert, and hard reset ask for confirmation. Pull, push, and fetch use the host's git remotes and credentials, and reloading the graph first fetches from all remotes.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/git-tree).*
