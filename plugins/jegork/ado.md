Adds Azure DevOps pull request support to Paseo through the Azure CLI. It requires Paseo 0.8.0-beta.1 or newer, plus the `az` CLI with the `azure-devops` extension installed and signed in on the daemon host. The plugin stores no credentials and runs `az` with that user's Azure DevOps access. The pinned repository's README says it is archived and now lives in `jegork/paseo-plugins`.

A pull request panel shows the active pull request for the current branch, reviewer votes, pipeline runs, and review comments, with a Create button when the branch has none. You can complete or set auto-complete from the panel, using a strategy the branch policy allows, and the plugin does not bypass policies. Send to agent forwards a comment, all open comments, the pipeline status, or a failed run's errors and log tail (up to 4,000 characters per failed task and 12,000 in total) to the workspace's agent. The plugin never writes to Azure DevOps comment threads.

In a workspace, `/adopr [title]` pushes the branch to `origin` if needed and opens a pull request, and `/ado-checkout <pr-id>` creates a worktree workspace on the pull request's source branch. The composer also gets Azure DevOps work item and pull request attachments.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-ado).*
