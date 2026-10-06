Usage Sidebar shows your AI provider plan usage in Paseo, using the same data as Settings → Usage. It adds a "Usage" item in the sidebar that opens a panel, and a Command Center entry to open it.

The panel lists each provider's usage windows (for example a 5-hour or weekly window) with percent used and reset times, and any balances or details the provider reports. Use the plus and minus button on a row to pin it to the sidebar meter, and drag pinned rows to reorder them. Before you pin anything, the meter shows every window of the first provider that reports usage.

## The sidebar meter

The meter is a small set of bars drawn directly under the sidebar item. Paseo has no sidebar widget API, so the plugin inserts it into the page next to the sidebar row. This works on desktop and web only, and it shows nothing if the Paseo layout does not match what the plugin expects. It refreshes every 60 seconds, follows the app's built-in themes, and dims after two failed refreshes. The panel itself refreshes every 60 seconds and has a refresh button.

## What it reads and stores

- Usage comes from Paseo's own provider usage listing through the plugin SDK. The plugin makes no network requests of its own and has no credentials.
- Your pinned rows (provider and window ids only) are saved on the host in `selection.json` under `paseo-usage-sidebar` in the XDG state folder (`XDG_STATE_HOME`, default `~/.local/state`). Pinned rows are therefore shared by every client connected to that host.
- The panel follows Paseo's language setting, which it reads from the app's local settings storage. It ships English, Arabic, Spanish, French, Japanese, Korean, Brazilian Portuguese, Russian and Simplified Chinese.

## Limits

If the connection to the Paseo daemon is lost, the panel asks you to reload the plugin. `PASEO_USAGE_SIDEBAR_FAULT` is a development switch that simulates failures. Leave it unset.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/usage-sidebar).*
