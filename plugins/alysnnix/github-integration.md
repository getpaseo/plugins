GitHub Integration adds a **GitHub** screen to Paseo that lists the pull requests, issues and discussions you are attached to, plus your GitHub Projects boards. You can read an item, approve or merge a pull request, edit labels, or send an issue or pull request to a new Paseo agent with one click.

## What it does

- **Pull requests, Issues, Discussions and Projects.** A switcher moves between the four views.
- **Everything you are attached to.** For each view the daemon runs one GitHub search per relationship (review requested, mentioned, assigned, authored) plus one per owner you watch, and merges the results. The board lists open items only, so closed issues and merged pull requests leave it.
- **Filters and search.** Chips for `Needs my review`, `Mentions me`, `Assigned to me`, `Mine` and `Other` narrow the list without a new request, and owner and repository pickers narrow it further. In the search box a plain word matches a title, repository or number, `/name` restricts to repositories, `#123` to numbers and `@login` to authors, and several terms combine.
- **Orderings.** Recently updated, recently created, or last commit.
- **Detail panel.** Shows the body, comments and checks, with the Markdown rendered. For a pull request it offers **Approve**, **Merge** (squash, merge or rebase, whichever the repository allows) and **Open on GitHub**. Labels can be edited on any item.
- **Send to chat.** Starts a new Paseo agent with a prompt template, in a workspace of your choosing (the project directly, or a new worktree), with the item's prompt as the first message and the item attached to the conversation as a card. The repository must match a Paseo project that has a git remote pointing at it. Otherwise the plugin says so and asks you to add the project first.
- **Projects.** Projects v2 boards you and your watched owners own, grouped by Status column. Projects need the `read:project` scope. Without it the tab shows the `gh auth refresh -h github.com -s read:project` command to run, with a button to copy it.

## Setup

- Paseo 0.8.0 or newer on the daemon and the app.
- The `gh` CLI, installed and authenticated on the daemon machine (`gh auth login`). The plugin runs `gh` as a subprocess for every query and uses whichever GitHub account `gh` is logged in as. There is no account switcher.
- Open **GitHub** in the sidebar. Under **GitHub board** settings you can:
  - add **watched owners** (organizations or users) whose open items are included beyond your own. Without any, the board shows only items related to you;
  - set the login the queries run as (the default is the `gh` account);
  - edit the prompt templates used by **Send to chat**, per item type (issues, draft pull requests, open pull requests, discussions) and per project. A `{url}` placeholder inserts the item's link. A blank template goes back to the default.

## What it reads, sends and stores

- **Reads from GitHub** through `gh api graphql` and `gh` searches on the daemon machine. Results come from GitHub search, so they are capped per query, and a watched owner with thousands of open items shows the most recently updated slice.
- **Writes to GitHub** only on your action: approving or merging a pull request, or changing a label.
- **Images.** The app only asks the daemon for an image when its URL is `https://github.com/user-attachments/...` or an `https://*.githubusercontent.com/...` address. Any other image URL in a comment is not loaded and shows as a link you can open yourself, so its host never sees your IP address from Paseo. For an allowed image the daemon runs `gh auth token` and sends the token to that URL. It follows up to five redirects itself and, on each hop, sends the token only if that hop's URL also passes the same GitHub check. A redirect to any other host (a signed storage URL, for example) is still fetched by the daemon, without the token, so that host does see the daemon's IP address. The response must be an image of at most 4 MiB. The token is kept in memory for five minutes and is not written to disk.
- **Creates Paseo workspaces and agents** when you use Send to chat. The last provider, model, mode and isolation you used are remembered as the next dialog's defaults.
- **Stores** its login and launch defaults in `settings.json` under `plugins/github-integration/` in the Paseo home directory, board data in a cache under `$XDG_STATE_HOME/paseo-github-integration/cache` (default `~/.local/state/paseo-github-integration/cache`), and display settings and prompt templates as Paseo plugin settings.
- The plugin is trusted, unsandboxed code that runs next to the daemon with the same access as your user, including whatever `gh` is logged in as.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/github-integration).*
