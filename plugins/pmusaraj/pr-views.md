PR Views adds a **GitHub PRs** sidebar item with saved GitHub searches for pull requests. Each saved view is a named GitHub search query, such as the default **Mine** view of your open PRs, and the plugin limits every query to pull requests. You can read an item's details and comments in Paseo, change its labels, approve or merge a pull request, and start an agent on it.

Queries accept GitHub search filters, AND/OR and relative dates such as `created:>@today-30d`. Cards show review status, CI checks, labels, comment counts and lines changed. The sidebar title gets a seedling when a view has new matches.

**Send to chat** starts a new workspace and agent from an item, with a prompt you can edit and a provider, model, mode and local or worktree choice. It works only when a Paseo project already has a git remote pointing at the item's repository, so add the project first. The agent's conversation gets a card for the item.

## Setup

Install the GitHub CLI on the daemon machine and run `gh auth login`. The plugin uses that login for everything it does on GitHub.

## What it does with your account

- It calls GitHub through `gh api graphql` and `gh` search on the daemon. Labels, **Approve** and **Merge** (merge, squash or rebase) are real write actions on GitHub with your account, and only run from the buttons.
- Comment images on `github.com/user-attachments/` and `*.githubusercontent.com` are fetched by the daemon with your `gh` token, because private attachments return 404 without it. The token is attached only while the request is on one of those hosts and is dropped on any redirect to another host, such as signed storage URLs. Images on other hosts load directly in the app.
- **Background checks** are optional per view. When enabled they run on the daemon every 10 minutes, with the app closed, and store the matching IDs in a cache folder under `~/.local/state/paseo-pr-views`. Separately, the app refreshes up to the first five views every five minutes while Paseo has focus.
- Saved views and display settings use Paseo's plugin settings, which the daemon reads from the Paseo home directory.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/pr-views).*
