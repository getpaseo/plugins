Commands adds slash commands to the agent composer for controlling the current agent: switch its model, mode, thinking effort, or a provider feature, apply a saved agent profile, rename the tab or workspace, cancel the running turn, and resend the latest prompt. Applying a profile refuses a profile for a different provider than the agent's. Individual commands can be turned off in settings. The plugin requires Paseo 0.9.0 or newer.

The plugin's server side connects to the local Paseo daemon and sends the same requests the app uses. If the daemon requires a password, set `PASEO_PASSWORD` in the daemon's environment, and a command fails with a message naming the address if the daemon cannot be reached.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/commands).*
