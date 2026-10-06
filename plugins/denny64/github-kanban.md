GitHub Kanban adds a Kanban item to the Paseo sidebar that shows a project's GitHub issues as a board. Each card is an issue in the project's GitHub repository, so the issues live in GitHub and changes you make on the board change those issues there. Paseo's host settings remember which project you selected, whether you view all projects, the agent you chose, and whether you use the board or list view.

Setup: the GitHub CLI (`gh`) must be installed and signed in with `gh auth login` on the machine running the Paseo daemon, and the project must be a git repository with a GitHub remote. The plugin runs `gh` with the daemon's environment and uses whatever GitHub account is signed in there, so it can read and write issues anywhere that account has access. It needs Paseo 0.9.2 or later.

The board columns map to issue state:

| Column | Issue |
| --- | --- |
| To do | Open, without a kanban label |
| In progress | Open, labelled `kanban:in-progress` |
| In review | Open, with an open pull request that closes it, or labelled `kanban:in-review` |
| Done | Closed issues, excluding those closed as not planned or as duplicate |

Dragging a card, or using the buttons in the card view, edits the issue: it adds or removes the kanban labels, or closes or reopens the issue. The plugin creates the labels in the repository the first time you move a card. **New card** creates an issue. **Close issue** closes it as completed, which moves it to Done. **Archive** adds the `kanban:archived` label to a done issue, or closes an open issue as not planned. **Clear** in the Done column archives every done card. A project picker lets you view one project or all projects on one board, and a list view groups the same cards by column. The board shows up to 500 open issues and the 30 most recently closed, and refreshes every minute (every five minutes for all projects).

Pressing the start button on a card, or choosing an agent in the card view, creates a new workspace on a new worktree of the project and starts the agent there with that issue attached. The first message you can edit before starting. By default it asks the agent to open a pull request containing `Closes #N`, and the card moves to In review while an open pull request that closes the issue exists, and to Done once GitHub closes the issue after the merge. Starting an agent sends the selected issue's content to that agent and moves the card to In progress.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-github-kanban).*
