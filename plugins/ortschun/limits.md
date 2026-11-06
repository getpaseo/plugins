Limits shows the usage limits of the provider behind the agent you are talking to, as a pill above the composer. Press it for the full breakdown of each limit window, its reset time and your plan.

It is a deliberately simple tool: one pill per agent, one popover, and no settings. For more control, Usage Monitor (`aborakati/usage-monitor`) adds usage dashboards, token history, configurable providers and per-provider pills. Usage Auto Resume (`babo-jeonguk/usage-auto-resume`) continues agents automatically after a limit resets.

## How it works

The plugin runs only in the app and gets its numbers from Paseo's own provider usage service. It has no credentials, files or network access of its own. Providers that Paseo's usage service does not report show "No limits". A custom provider that extends a built-in one shows that built-in provider's limits.

Paseo does not report how long Codex's primary window is, so the plugin estimates whether it is a 5-hour or a weekly window from its reset time, and the label can be wrong.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-limits).*
