Shows the workspace's branch history as a commit graph in a Git Tree tab, and lets you run git operations from it. It requires Paseo 0.8.0 or newer. Open it from the new-tab menu in a workspace.

You can browse branches, tags, and commit diffs, compare two commits, and search by message, author, hash, branch, or file path. You can also change the repository. The branch menu offers checkout, create, rename, merge, rebase, pull, fetch, push, force push, and delete, including deleting a remote branch. The commit menu offers checkout, cherry-pick, revert, merge, rebase, reset (including hard), branch, and tag. Rebase, force push, delete, revert, and hard reset ask for a second click to confirm.

Everything runs as `git` on the daemon host in the workspace directory, so pull, fetch, and push use that host's git remotes and credentials. Reloading the graph runs `git fetch --all --prune` first when the repository has remotes.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/git-tree).*
