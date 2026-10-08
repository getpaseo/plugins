GitHub Board adds a **GitHub** sidebar screen showing your issues, draft pull requests, open pull requests and discussions. It shows what you authored, what is open in repositories you own, and, for issues and pull requests, what is assigned to you. Items you only commented on, and pull requests you were only asked to review, do not appear. An issue with an open pull request is folded into that pull request's card. Pull request cards show check results and whether the branch is out of date or has conflicts.

From a card you can read the description and comments and send it to an agent. **Send to chat** creates a new workspace on the project whose git remote matches the card's repository, starts the agent you pick, and sends your first message. The default prompt per column can be edited, globally or per project, and the board can be filtered by repository.

Opening and closing cards updates the panel within the current board. A link that names a card opens it on arrival; back and forward leave the board rather than stepping through cards. Reloading returns to the card named in the original link, rather than the last card clicked.

Two actions write directly to GitHub:

- Adding or removing labels on issues and pull requests.
- **Update branch**, which merges the base branch into a pull request's branch when GitHub allows it. It never rebases.

Setup:

- Paseo 0.11 or newer on the daemon and the app.
- `gh` installed and authenticated on the daemon machine. Label and branch updates need a login with write access to the repository.
- The board follows the login set in its header, otherwise the account `gh` is signed in as.

What it reads and sends:

- All data comes from `gh api graphql` calls on the daemon.
- To show images from comments, including on private repositories, the daemon fetches images hosted on `github.com` or `*.githubusercontent.com` over HTTPS. It runs `gh auth token` and sends the token only to `github.com`. Redirects to other hosts are followed without the token.
- Settings are saved on the daemon host.

Limits: each column shows a limited number of items (30 by default, up to 100), and sending to another computer only matches a project whose main remote is the card's repository.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/github-board).*
