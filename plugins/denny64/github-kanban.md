GitHub Kanban adds a Kanban item to the Paseo sidebar that shows a project's GitHub issues as a board, with a list view of the same cards. Each card is an issue in the project's GitHub repository, so the issues live in GitHub.
The GitHub CLI (`gh`) must be installed and signed in with `gh auth login` on the machine running the Paseo daemon, and the project needs a GitHub remote. The plugin runs `gh` with the daemon's environment and uses whatever GitHub account is signed in there. It requires Paseo 0.9.2 or later.

Using the board changes GitHub. Moving a card adds or removes `kanban:` labels, which the plugin creates in the repository, or closes or reopens the issue. New card creates an issue, and Archive labels or closes one. Starting an agent from a card creates a workspace on a new worktree of the project, sends that issue to the agent, and moves the card to In progress.

The board shows up to 500 open issues and the 30 most recently closed. A card with an open pull request that closes it stays in In review, so dragging it elsewhere does not stick until the pull request is merged or closed.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-github-kanban).*
