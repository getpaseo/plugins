Defer queues a message to an agent and delivers it later. A message can wait for a delay (a preset of 15 minutes, 1 hour or 3 hours, or any time you type up to 30 days), a local clock time such as `21:30` or `9:30 pm`, or the next reset of the target agent's provider usage window. When a message is due, Defer waits for the agent to be idle so the message arrives as a new message and does not interrupt a running turn. Typed times show what they resolved to before anything is queued.

The queue is stored on the daemon, so it survives plugin reloads, Paseo restarts and closing the app.

## Where it appears

- A **Defer** pill beside the composer's task and subagent pills. It opens a popover with the message box, timing options and anything already queued for that session. Once something is queued, the pill shows the time left or a count. A setting can hide the pill until something is queued.
- A draft already in the composer is copied into the popover, not moved, so clear the composer yourself if you do not also want to send it now. On iOS the box opens empty.
- `/defer 2h ship the release notes` in the composer. The timing comes first (`45m`, `1h 30m`, `21:30`, `at 9:30 pm`, `reset`). A line that names no time opens the panel with your text.
- A **Defer** panel for a session, and a **Deferred** sidebar surface across all sessions with an **Open session** action. Waiting messages can be edited or cancelled until delivery starts.
- **Defer a message** in the Command Center (⌘K / Ctrl+K).

## What it reads, stores and sends

- Queued message text and settings are stored as `queue.json` and `settings.json` in the daemon's plugin data directory, located from `PASEO_HOME`.
- Delivery and the usage window read connect back to the local daemon through a separate daemon client, sending the queued message to the target agent. The connection URL comes from `PASEO_DAEMON_URL`, otherwise from the daemon address in its config file, otherwise `127.0.0.1:6767`.
- For a password-protected daemon, the plugin reads the plaintext password from `PASEO_PASSWORD`, then from the file named by `PASEO_PASSWORD_FILE`, then from a default secret file used on Paseo VM hosts. It passes the password to each short-lived daemon connection and does not log or store it.
- Carrying the composer draft reads the app's composer-draft storage on the device, only when you press **Defer**. It is sent to the daemon only if you queue it.

Requires Paseo 0.8.0 or newer.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-defer).*
