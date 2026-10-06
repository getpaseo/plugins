Schedule Runs adds a **Schedule runs** sidebar feed of what the schedules on the host you are viewing have produced: each run's status, the workspace and agent it created, and the agent's final response. Paseo's own Schedules screen lists the schedules, and this feed shows their output. It is read-only and never creates, edits, pauses or deletes a schedule. Switching hosts reloads the feed for that host.

## Access

Paseo's plugin interface has no schedules API, so the daemon side reads Paseo's own schedule files and workspace registry in the Paseo home directory, and lists agents and workspaces through Paseo. It writes nothing and makes no network requests.

When a run recorded no response, **Load from transcript** fetches the agent's recent timeline and shows its last assistant message. That happens only when you press it.

Requires Paseo 0.7.2 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/schedule-runs).*
