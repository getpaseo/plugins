Auto-Pin pins every new Paseo workspace for you, so everyday work lands in the **Pinned** section of the sidebar without a manual step. It runs in the background, whether or not its panel is open. It starts with auto-pin on for all projects.

## Rules

Open **Auto-Pin** in the sidebar, or use **Auto-Pin: Open Panel** in the Command Center. **Pin new workspaces by default** is the global switch. Each project can override it:

| Rule | When you create a workspace |
| --- | --- |
| **Follow default** | Uses the global switch. |
| **Always** | Pins it, even when the switch is off. |
| **Never** | Leaves it unpinned, even when the switch is on. |

Rules apply to new workspaces in that project, worktrees included. **Auto-Pin: Toggle Default** in the Command Center flips the global switch. Projects come from Paseo and can be searched by name or folder path. Changes save at once and are shared by every client connected to the same daemon.

## What it does and does not do

- It pins a workspace when Paseo reports it as created, if the rule allows it and the workspace is not archived. It pins only that workspace.
- It never unpins anything. Pins you set or remove yourself stay as you left them.
- Existing workspaces are not touched, and restoring an archived workspace does not pin it again.
- Turning the default switch off does not stop projects set to **Always**. To pause everything, disable the plugin in Paseo's plugin settings.

## What it reads and writes

The plugin's settings (the default switch and project rules) are stored in `plugin-data/auto-pin.json` under the Paseo home directory.

To pin a workspace, the plugin opens a short-lived connection from the daemon process to the daemon's own WebSocket endpoint and sends the pin request, then closes it. It reads the daemon's configured address (`daemon.listen`) from `config.json` in the Paseo home directory, and uses `127.0.0.1:6767` when none is set. A wildcard bind address such as `0.0.0.0` is changed to `127.0.0.1`. If the configured address is not reachable from the daemon process, that pin fails and the plugin logs the error. The plugin makes no other network connections.

On Paseo 0.9.2, a newly applied pin can briefly disappear from the sidebar before it returns. The pin itself is kept by the daemon.

Requires Paseo 0.9.1 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/auto-pin).*
