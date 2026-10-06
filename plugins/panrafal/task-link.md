Task Link adds a composer pill when an agent's branch, title or workspace name contains a task ID, and pressing it opens the matching task link in your browser.

The shipped defaults match IDs like `CT-1234` (pattern `\b([Cc][Tt]-\d+)\b`) and open `https://www.notion.so/{ID}`. Change both before relying on the pill.

## Setup

Open **Settings, Plugins, task-link, Task link**, or **Configure task link** in the Command Center, and set:

- **Task regular expression**, a JavaScript pattern without delimiters or flags. Matching is case-sensitive. The first non-empty capture group is the ID, or the whole match when there are no groups.
- **Task link**, an `http://` or `https://` URL containing `{ID}`, which is replaced with the URL-encoded ID.

A preview in the settings screen shows the extracted ID and destination for a sample branch or title.

## How it works

- The plugin checks the git branch, then the agent title, workspace title and workspace name, and uses the first match. The daemon reads the branch with `git rev-parse --abbrev-ref HEAD` in the agent's directory, and a detached HEAD or a non-git folder gives no branch.
- The pill disappears when nothing matches or the agent is archived.
- Settings are saved to `$PASEO_HOME/plugin-data/task-link/settings.json` on the daemon and shared by its clients, which pick up changes within 15 seconds. The plugin makes no network requests, and the link only opens in your browser when you press the pill.

Requires Paseo 0.7.2 or later, and a client that supports plugin settings screens.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/task-link).*
