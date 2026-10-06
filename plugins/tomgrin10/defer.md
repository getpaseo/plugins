Defer queues a message to an agent and delivers it later: after a delay (up to 30 days), at a local clock time, or when the agent's provider usage window next resets. When a message is due, Defer waits for the agent to be idle so it arrives as a new message and does not interrupt a running turn. The queue is stored on the daemon, so it survives plugin reloads, Paseo restarts and closing the app.

You queue messages from a **Defer** pill beside the composer, a `/defer 2h <message>` command, a Command Center item, or a **Deferred** sidebar surface that covers every session. Queued messages can be edited or cancelled until delivery starts. A draft already in the composer is copied into the Defer box, not moved, so clear the composer yourself if you do not also want to send it now. On iOS the box opens empty.

What it stores, reads and sends:

- Queued message text and settings are stored on the daemon host.
- To deliver messages and read the usage window, the plugin connects back to the local daemon through a separate daemon client and sends each message to its target agent.
- For a password-protected daemon, it reads the daemon's authentication credentials to connect. They are not logged or stored by the plugin.
- Carrying over a composer draft reads the app's draft storage on your device, only when you press **Defer**.

Requires Paseo 0.8.0 or newer.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-defer).*
