Sayr adds a task board for [Sayr](https://sayr.io) projects inside Paseo. It lists tasks from every organization your Sayr account belongs to in backlog, todo and in-progress columns, with search and per-organization and per-priority filters. Done and canceled tasks are not fetched. Opening a task shows its description and comments in a side sheet, where you can change status, priority, assignees and labels, create labels, and add comments. Send to agent starts a new Paseo agent in a project you choose, seeded with the task's title, status, priority, description and recent comments plus optional instructions. A preview shows the exact prompt before it is sent.

## Setup

The plugin does not call the Sayr API itself. It runs the Sayr CLI on the machine running the Paseo daemon, so an authenticated Sayr CLI must be available there, signed in with an API key from Sayr.io or a self-hosted Sayr instance. The CLI stores the login. The plugin never sees or stores the key. Paseo 0.8 or newer is required.

## Settings

Settings, Plugins, Sayr has three options, stored in `plugins/sayr/settings.json` under the Paseo data directory:

- **CLI binary**: the command to run, `sayr` by default. Set it to another installed binary, such as a local-backend build, to use a different Sayr backend.
- **Default agent instructions**: prefilled into the Send to agent instructions field, where you can edit them for each send.
- **Web URL template**: overrides the link used by Open on Sayr for self-hosted setups, with `{org}` and `{shortId}` placeholders.

## Reads and sends

- Runs `sayr` commands with `--json` on the daemon host, with a 30 second timeout each. They read organizations, tasks, comments and labels, and write status, priority, assignee, label and comment changes to Sayr through the CLI.
- Each organization's board is limited to 3,000 tasks (100 pages of 30).
- Send to agent creates a workspace and agent in your Paseo host and sends them the task text.

## Known limits

Existing labels cannot be renamed, recolored or deleted from the plugin. Tasks that are done or canceled drop off the board, though they can be set through the status picker.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/sayr).*
