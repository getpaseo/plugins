Commands adds eight slash commands to the agent composer for controlling the current agent without leaving the conversation:

- `/model [model]`: show or switch the model.
- `/effort [level]`: show or set the thinking effort for the current model.
- `/mode [mode]`: show or switch the mode.
- `/feature [name] [value]`: show or set a provider feature, for example `/feature fast_mode on`.
- `/profile [profile]`: apply the model, mode, thinking effort, and feature values of a saved agent profile.
- `/rename [-t|-w] <title>`: rename the current tab, or the workspace with `-w` or `--workspace`. `-t` and `--tab` are the default.
- `/cancel`: cancel the agent's running turn. It reports an error when the agent is not running.
- `/resend [text]`: send the agent's latest non-empty user prompt again, with any extra text appended on a new line.

Used without an argument, `/model`, `/effort`, `/mode`, `/feature`, and `/profile` open a menu with the current choice checked. With an argument, the value is matched case-insensitively against option ids and labels, and an exact match wins over a unique prefix. An ambiguous value lists the candidates. Options come from what the agent's provider reports, so a provider with no models, modes, or features reports that instead of showing a menu.

`/profile` skips fields that only apply at launch and lists what it skipped. It refuses a profile whose provider differs from the agent's, because a running agent cannot change provider.

## Settings

Settings, under the plugin's page, turns individual commands on or off (a host setting, all commands on by default). A disabled command no longer appears in slash autocomplete, so a provider's own command with the same name takes over if it has one.

## What it connects to

The plugin SDK cannot change agent settings yet, so the plugin's server side opens its own connection to the local Paseo daemon and sends the same requests the app uses (set model, mode, thinking effort, or feature, apply a profile, rename, cancel). It finds the daemon at `PASEO_LISTEN` if that is set, otherwise at the address recorded in `$PASEO_HOME/paseo.pid`, otherwise at `127.0.0.1` on `PORT` or 6767. If the daemon requires a password, set `PASEO_PASSWORD` in the daemon's environment. If the daemon cannot be reached, a command fails with a message naming the address.

The source makes no other network connections. The plugin requires Paseo 0.9.0 or newer.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/commands).*
