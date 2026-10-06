Readable Agent Activity replaces Paseo's tool-call rows with expandable cards that show Input and Output as formatted, syntax-highlighted JSON, and gives Thinking rows a matching compact header. Long output is previewed, with Show all to expand it. Messages, approvals and the composer stay native.

Use the cards with Full detail. They bypass Summary grouping, so before switching to Summary, run "Activity: use native tool rows (for Summary)" from the Command Center on that client, and "Activity: use tool cards (Full detail)" to switch back. The choice applies to that client only and resets to cards whenever the plugin reloads.

The plugin runs entirely on the client and reformats data Paseo already received, without summarizing or rebuilding diffs. Show all on a very large payload can be slow.

Do not enable it next to another plugin that replaces tool-call or Thinking timeline items. It targets Paseo 0.8 and later. The author tested a macOS host and the web client, and native iOS and Android are untested. It is a fork of Matt Cowger's Colorful Agent Activity.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/readable-agent-activity).*
