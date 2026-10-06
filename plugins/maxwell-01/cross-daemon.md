Cross-daemon lets agents on one Paseo daemon list and read agents on other Paseo daemons and send them messages. Every participating daemon needs this plugin and Paseo 0.9.2 or newer, and you switch daemons on in the Paseo app, where they are off by default.

Each switched-on daemon gives its pairing link, the kind `paseo pair` produces, to the other switched-on daemons. A pairing link lets a client connect to the daemon it belongs to, so agents on any switched-on daemon can list workspaces and agents, read agent activity, and send prompts on every other one. Only switch on daemons you want to give each other that reach. Links are stored on each daemon with owner-only permissions, which does not keep out that daemon's own agents because they run as the same user.

Only the app can reach every daemon, so it syncs the peer lists and they change only while the app is open. A daemon keeps its last list when the app closes, and a daemon that does not answer a sync stays on the others' lists, so the lists can be stale. Switching a daemon off clears its own list.

Every new Claude, Codex, or OpenCode agent on a daemon with the plugin gets the cross-daemon tools, whether or not that daemon is switched on, and a switched-off daemon has no peers to reach. Agents created earlier do not get them. The tools are pre-approved for Claude and Codex agents, so they run without a permission prompt, and they are not pre-approved for OpenCode.

A message to an idle agent is delivered right away, and a message to a working agent is queued in the plugin's own storage and survives a restart. A send cut off by a restart or timeout is not retried, because it may have been delivered. The sender's agent ID comes from the `PASEO_AGENT_ID` variable of its tool process. Without it the message is labeled as from a user or script, and it carries no reply instructions and no finish notice.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/cross-daemon).*
