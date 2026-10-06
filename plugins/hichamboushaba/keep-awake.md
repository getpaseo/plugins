Keep Awake stops the computer running the Paseo daemon from sleeping while agents work, and releases the hold 60 seconds after the last agent or subagent finishes. It holds the host awake, so it does not wake a machine that is already asleep.

Each workspace header gets a button with three modes. **While an agent is working** is the default and holds while any agent turn or provider-reported subagent is running. **Always** holds for as long as Paseo is running. **Off** never holds. The same choices are available in the Command Center. The setting is shared by every client of the host. Settings, under Plugins, also show the daemon platform, whether a hold is active, how many agents require it, and the command in use.

The hold is a local operating-system inhibitor started by the plugin on the daemon host:

| Host | Mechanism | Keep the display on too |
| --- | --- | --- |
| macOS | `caffeinate` | Supported, off by default |
| Linux | `systemd-inhibit`, plus `gnome-session-inhibit` in a GNOME session | Not supported |
| Windows | PowerShell calling `SetThreadExecutionState` | Supported, off by default |

Linux needs systemd for the built-in hold, and hosts without it need a custom command. An unsupported platform tracks agent activity but starts no hold unless you set a custom command. The custom command replaces the built-in one, is run directly without a shell, must keep running while the hold is active, and can use `{pid}` for the plugin's process id so it exits when the plugin does.

The built-in hold only starts those local inhibitors. On Linux it passes the daemon's environment to them and falls back to the default session bus address if `DBUS_SESSION_BUS_ADDRESS` is unset. After a reload it can run the `paseo` CLI (using `PASEO_CLI` and `PASEO_HOME` when set) to list running agents.

Limits:

- A pending permission prompt does not end a turn, so the host stays awake while it waits.
- The plugin's documentation says closing a MacBook lid still sleeps Apple Silicon machines, because `caffeinate` cannot override clamshell sleep.
- Background shell commands, schedules and heartbeats are not visible to the plugin, so use **Always** if you rely on them.
- Only providers that report subagents to Paseo are covered for subagents.
- Holds apply to the whole host, with no per-workspace or per-provider filters.

The manifest requires Paseo 0.9.0-beta.2 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/keep-awake).*
