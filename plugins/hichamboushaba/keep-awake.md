Keep Awake stops the computer running the Paseo daemon from sleeping while agents work, and releases the hold a minute after the last agent or subagent finishes. It cannot wake a machine that is already asleep.

Each workspace header gets a button with three modes: **While an agent is working** (the default), **Always**, and **Off**. The choice applies to the whole host and is shared by every client. On macOS and Windows you can also keep the display on, which is off by default. Linux supports the system hold only, and needs systemd for the built-in hold. On a host without systemd or on an unsupported platform, set a custom command. The custom command replaces the built-in hold, is run directly without a shell, and must keep running for as long as the hold should last.

Limits:

- A pending permission prompt does not end a turn, so the host stays awake while it waits.
- The plugin's documentation says closing a MacBook lid still sleeps Apple Silicon machines, because `caffeinate` cannot override clamshell sleep.
- Background shell commands, schedules and heartbeats are not visible to the plugin, so use **Always** if you rely on them.
- Subagents are covered only for providers that report them to Paseo.

The manifest requires Paseo 0.9.0-beta.2 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/keep-awake).*
