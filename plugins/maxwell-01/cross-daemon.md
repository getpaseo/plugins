Cross-daemon lets agents on one Paseo daemon list, read, and message agents on other Paseo daemons. You switch daemons on in the app, and the daemons you switch on can reach each other through five tools that agents call.

Every daemon that takes part needs this plugin and Paseo 0.9.2 or newer.

## Permissions to consider first

A switched-on daemon hands its pairing link (the same kind of link `paseo pair` produces) to the other switched-on daemons. Each daemon stores the others' links and uses them to run `paseo` CLI commands against them, so agents on any switched-on daemon can list workspaces and agents, read agent activity, and send prompts on every other switched-on daemon. A pairing link lets a client connect to the daemon it belongs to, so only switch on daemons you want to give each other that reach.

For Claude and Codex agents the five tools are pre-approved in the agent's tool policy, so they run without a permission prompt. Links are stored in `$PASEO_HOME/plugin-data/cross-daemon/` with owner-only permissions, which keeps other users out but not the daemon's own agents, since they run as the same user. The tools never print a link, and the plugin replaces links with the daemon's name in error messages.

## Setup

Daemons are off by default. Open Cross-daemon in the app's sidebar to see every daemon the app is connected to, each with a switch and the daemons it can reach. The same switch is in each host's settings, as "Allow cross-daemon comms". A daemon without the plugin, or offline, is listed but cannot be switched on.

The app does the syncing, because it is the only party that can reach every daemon. While it is open it syncs every host with the plugin, one at a time: when it connects, one second after a switch changes, and every minute. Each daemon receives the names and links of the other switched-on daemons. Peer lists change only while the app is open, and a daemon keeps its last list when the app closes. Switching a daemon off clears its list immediately, and the others drop it at their next sync. A daemon that does not answer a sync keeps its place on the others' lists until it answers as switched off.

## Agent tools

Every new Claude, Codex, or OpenCode agent on a daemon that has the plugin gets a `cross-daemon` MCP server, whether or not that daemon is switched on. Other providers are unchanged. On a daemon that is switched off the peer list is empty, so the tools have no daemons to reach. OpenCode agents get the tools without pre-approval. Agents keep the tools they were created with, so agents created earlier do not get them.

| Tool | What it does |
| --- | --- |
| `list_daemons` | Lists the reachable daemons by name and server ID. |
| `list_workspaces(daemon)` | Lists that daemon's workspaces. |
| `list_agents(daemon)` | Lists that daemon's agents with status and folder. |
| `get_agent_activity(daemon, agentId, tail)` | Reads an agent's recent activity, 1 to 500 entries (default 30). |
| `send_agent_prompt(daemon, agentId, prompt, notifyOnFinish)` | Sends a message to an agent. |

`daemon` is a name or a server ID. Use the server ID when two daemons share a name.

## Sending messages

`send_agent_prompt` does not interrupt a working agent. An idle agent gets the message right away. If the agent is working, the message is queued, and every 15 seconds the plugin delivers the oldest queued message for each agent that has become idle. The queue is saved to disk and survives a restart.

Each message is wrapped between two lines carrying a random marker, and a header states which agent and daemon sent it and how to reply. The marker frames the sender's text for the receiving agent, and nothing enforces that the receiver treats text inside as plain content. The sender's agent ID comes from the `PASEO_AGENT_ID` environment variable of the agent's MCP server process. When it is present, the message includes the reply instructions, and with `notifyOnFinish` (on by default) the sender gets a notice with the target's last message once the target finishes. The notice waits until the sender is idle. When the ID is missing, the message is labeled as from a user or script, and it has no reply instructions and no finish notice.

Limits, each reported back to the sender:

- A message that waits more than 24 hours is dropped, as is a message to an agent that is archived, missing, or ambiguous.
- A send cut off by a restart or a timeout is not repeated, because it may have been delivered.
- At most 20 messages wait per agent, and a prompt is at most 50,000 characters.
- A finish notice is given up after 24 hours.
- If the target starts a turn of its own between the plugin's idle check and its send, the target is interrupted, as with Paseo's own `send_agent_prompt`.

## What runs where

The plugin runs the `paseo` CLI that ships with the daemon, using the daemon's own Node, to talk to the other daemons through their links. To build the daemon's own pairing link it loads Paseo's pairing and configuration modules from the running daemon's package. It runs a local socket in its data folder with owner-only permissions, which the agents' MCP server uses to reach the plugin. Message text is passed to the CLI through a temporary file with owner-only permissions that is deleted afterward.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/cross-daemon).*
