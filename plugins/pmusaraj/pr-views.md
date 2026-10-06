PR Views adds a **GitHub PRs** sidebar item with saved GitHub searches for pull requests. Each saved view is a named search, such as the default **Mine** view, and the plugin limits every search to pull requests. You can read a pull request's details and comments, change its labels, approve or merge it, and start an agent on it.

## Setup

The daemon machine needs the GitHub CLI, signed in with `gh auth login`. To start an agent from a pull request, a Paseo project must already have a git remote pointing at that repository. The agent starts in a new workspace with a prompt you can edit first.

## Access

- The daemon uses your `gh` login for everything. Reading is automatic, and labels, **Approve** and **Merge** are real writes to GitHub that run only when you press the button.
- Comment images on `github.com/user-attachments/` and `*.githubusercontent.com` are fetched by the daemon with your `gh` token, because private attachments need it. The token is sent only to those hosts and is dropped if a redirect leads elsewhere. Images on other hosts load directly in the app.
- **Background checks** are optional per view. When on, the daemon checks the view on a schedule even with the app closed and keeps the matching IDs in a cache folder under `~/.local/state`.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/pr-views).*
