Keep Awake stops the computer running the Paseo daemon from sleeping while agents work, and releases the hold a minute after the last agent or subagent finishes. It cannot wake a machine that is already asleep.

Each workspace header gets a button with three modes: **While an agent is working** (the default), **Always**, and **Off**. The choice applies to the whole host and is shared by every client. On macOS and Windows you can also keep the display on, which is off by default. Linux supports the system hold only. Its built-in command takes a systemd idle inhibitor and, when available, a GNOME suspend inhibitor. It waits for the GNOME session manager so a later graphical login can gain protection without reloading the plugin. If neither inhibitor is available, or on an unsupported platform, set a custom command. The custom command replaces the built-in hold, is run directly without a shell, and must keep running for as long as the hold should last.

The plugin observes agent and subagent activity and stores its options in host-scoped settings. It runs local power-management commands; before a daemon API handle is available, it uses the local Paseo CLI to list running agents. No external service or account is required. Custom commands inherit the daemon environment.

Limits:

- If GNOME disappears while its inhibitor tool is still running, that inhibitor cannot be replaced until the tool exits; the systemd idle inhibitor remains independent.
- A pending permission prompt does not end a turn, so the host stays awake while it waits.
- The plugin's documentation says closing a MacBook lid still sleeps Apple Silicon machines, because `caffeinate` cannot override clamshell sleep.
- Background shell commands, schedules and heartbeats are not visible to the plugin, so use **Always** if you rely on them.
- Subagents are covered only for providers that report them to Paseo.

The manifest requires Paseo 0.9.0-beta.2 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/keep-awake).*
