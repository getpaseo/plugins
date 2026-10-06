GitHub Board adds a **GitHub** sidebar screen that shows your issues, draft pull requests, open pull requests and discussions in four columns, and lets you start an agent on any card.

Each column combines GitHub searches for items you authored, items in repositories you own, and, for issues and pull requests, items assigned to you. Items you only commented on, and pull requests where you were only asked to review, do not appear. An issue that already has an open pull request is folded into that pull request's card. Pull request cards show check counts (passed, failed, running), and an **Out of date** or **Conflicts** pill when the base branch has moved. Empty columns are hidden, and each column loads and fails independently.

## What you can do

- **Open a card** to read its description, labels, branches and assignees in a side panel, load up to the first 50 comments, and see pasted screenshots, including those on private repositories.
- **Send to chat** opens a New workspace dialog that creates a workspace on the project whose git remote matches the card's repository, starts the agent you choose, and sends your first message. Prompt templates per column accept `{url}`, `{title}`, `{number}` and `{repository}`, and can be overridden per project.
- **Edit labels** on issues and pull requests by right-click or long-press. This writes to GitHub immediately.
- **Update branch** on out-of-date pull requests merges the base branch into the pull request branch on GitHub when GitHub allows it. It never rebases.
- Filter by repository from the header dropdown.

## Setup

- Paseo 0.11 or newer on the daemon and the app.
- `gh` installed and authenticated on the daemon machine. Labels and Update branch need a login with write access to the repository.
- The board follows the login typed in the header, then a saved login, then the account `gh` is signed in as.

## What it reads and sends

All data comes from `gh api graphql` calls on the daemon, with separate calls for checks and branch status so a token without check access only loses those pills. To show attachment images, the daemon fetches images hosted on `github.com` or `*.githubusercontent.com` over HTTPS. It runs `gh auth token` and sends the token only to `github.com`. Redirects are followed over HTTPS, and a redirect to any other host is fetched without the token. Settings (login, hidden repositories, prompts, send-dialog choices) are saved in a `settings.json` under the daemon's plugin data directory, located from `PASEO_HOME`. The board is cached in memory for five minutes, and **Refresh** bypasses the cache.

## Limits

- Each column holds at most 30 items by default (configurable up to 100).
- The label menu lists the repository's first 100 labels and cannot create labels.
- Sending to a different computer only matches a project whose main remote is the card's repository, and the conversation does not open with the card attached.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/github-board).*
