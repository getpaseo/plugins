Adds Azure DevOps pull request support to Paseo through the Azure CLI. It requires Paseo 0.8.0-beta.1 or newer, and the `az` CLI with the `azure-devops` extension installed and signed in on the daemon host. The plugin runs `az` with that user's Azure DevOps access. The pinned repository's README says it is archived and now lives in `jegork/paseo-plugins`.

It shows a branch's pull request status in a panel and can create the pull request, push the branch, and complete it or set auto-complete within branch policy. It can also open a workspace on a pull request's source branch, forward review comments and failed pipeline output to the agent, and attach work items and pull requests to the composer. It does not write to review comment threads.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-ado).*
