Limits shows your subscription limits for the agent you are talking to as a pill above the composer. A Claude agent shows Claude limits and a Codex agent shows Codex limits, for example `5h 18% · wk 16%`.

Press the pill for a popover with every limit window as a bar, its reset time, your plan, and any balances. A small amber dot appears on the provider logo when a window reaches 70% used and a red one when it reaches 90%. The pill sits in the track bar above the composer next to Tasks and Subagents, because plugins cannot add to the composer's bottom row.

## How it works

The plugin runs only in the app. It asks Paseo for provider usage and daemon config through Paseo's own client interface, every two minutes and again when the popover opens (at most every 15 seconds). It has no credentials, files, network access or daemon component of its own. A custom provider that extends a built-in one, such as a profile of `claude`, shows the built-in provider's limits, and the plugin follows that `extends` setting from the daemon config.

## Limits

- Only providers that Paseo's usage service reports show numbers. Others show "No limits", and a failed read shows "Limits unavailable".
- Paseo does not report the length of Codex's primary window, so the plugin labels it weekly when it resets more than six hours away and 5-hour otherwise.
- Claude and OpenAI logos are bundled. Other providers get a small two-bar meter.
- Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-limits).*
