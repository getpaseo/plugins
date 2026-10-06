Task Link adds a composer pill when an agent's git branch, title or workspace name contains a task ID. Pressing the pill opens the matching task link in your browser. It opens only when you press it, and the plugin makes no network requests of its own.

## Setup

The defaults match IDs like `CT-1234` and open a Notion link, so change them first. In the plugin's settings, set two things:

- A JavaScript regular expression (no delimiters or flags) that identifies the task ID.
- An `http://` or `https://` link template containing `{ID}`.

The settings are saved on the daemon and shared by every client of that daemon. The daemon reads the branch with `git` in the agent's directory.

Requires Paseo 0.7.2 or later, and a client that supports plugin settings screens.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/task-link).*
