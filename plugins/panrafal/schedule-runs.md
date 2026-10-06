Schedule Runs adds a **Schedule runs** sidebar item with one feed of every run produced by the schedules on the selected host. Paseo's own Schedules screen lists the schedules, and this feed shows what came out of them.

Each run shows its status, schedule name, start time and duration, the workspace and agent it created (with archived markers), a pull request link when one is known, and a preview of the agent's final response. Expanding a run shows the full response as markdown, any error, timestamps and ids. Runs are grouped by day, week, month and year, newest first, and the server returns the newest 500. You can filter by search words, schedule, status and archived state. Schedules that prompt an existing agent (heartbeats) are hidden unless you switch **Show heartbeats** on. **Open agent** and **Open workspace** work for archived targets too, and a pull request link opens in your browser. A Command Center item opens the feed, and the feed polls every 15 seconds.

## What it reads

- The plugin has no schedules API to call, so the daemon side reads Paseo's own files: the schedule records under `$PASEO_HOME/schedules`, which hold each run's output, and the workspace registry at `$PASEO_HOME/projects/workspaces.json`. It also lists agents (archived ones included) and workspaces through Paseo's plugin interface. It writes nothing and makes no network requests.
- The pull request for a run comes from the live workspace, then from the registry record of an automatic archive on merge, and otherwise from the first pull request URL in the agent's response.
- **Load from transcript** fetches the tail of the agent's timeline and shows its last assistant message when a run recorded no response. It runs only when you press it, and the result is kept for the rest of the app session.
- The plugin never creates, edits, pauses or deletes schedules. Responses are cut at 50,000 characters, and the markdown renderer shows tables and raw HTML as plain monospace text.

Requires Paseo 0.7.2 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/schedule-runs).*
