Cross-daemon lets agents on different Paseo daemons list workspaces and agents, read recent activity, send messages, and start or archive agents. Every participating daemon needs this plugin and Paseo 0.9.2 or newer.

Open Settings → Plugins → cross-daemon → Settings. Switch on at least two daemons under “This daemon” or “All daemons” and keep the app open until they sync. Switches are off by default. Each enabled daemon shares its relay pairing link with the others. A pairing link grants full control of its daemon, so enable only daemons you trust with that access. Links are stored with owner-only permissions, which do not exclude agents running as the same user.

The connected app synchronizes peer lists on connection, after switch changes and every minute. Lists persist when the app closes. An unreachable daemon stays on its peers’ lists until it answers switched off; switching off clears its own peers immediately.

## Agent tools

New Claude, Codex and OpenCode agents receive the cross-daemon tools. Claude and Codex tools are pre-approved; OpenCode tools are not. Agents created before installation or before an update adds a tool keep their previous tools.

- List remote daemons, workspaces and agents, or read an agent’s recent activity.
- Send a prompt immediately to an idle agent or queue it while the agent works. Queues survive a restart, expire after 24 hours and hold up to 20 waiting messages per agent. A send interrupted by timeout or restart is not repeated because it could already have arrived. A turn that starts independently between the idle check and delivery can still be interrupted.
- Start an agent in an absolute folder on a selected daemon, reusing its workspace for that folder or creating a local workspace. The default permission mode is `auto`; callers can select another mode and provider. First prompts are limited to 30,000 characters and travel in process arguments, where other local users can see them.
- Archive an idle agent recorded as started through this daemon’s cross-daemon tools. Cleanup also archives a workspace the plugin created when no other listed agent uses its folder. It keeps the workspace when the agent list reaches its 200-entry limit. Membership is inferred from folders: an agent assigned to that workspace with a different folder is not detected and is archived with it. Workspace archiving also closes its terminals.

Messages and finish notices appear as compact timeline rows that expand to show their text. Send, create and archive tool calls also get compact rows; send and create rows expand to show the prompt.

## Data and limits

The plugin reads local daemon configuration and pairing information, uses the installed Paseo CLI to connect to selected peers, and writes owner-only peer, queue, completion-watch and agent-ownership records in its plugin data directory. Its local MCP proxy and socket expose the tools to agents; it does not download software.

Prompts, activity and completion text move between selected daemons and can reach their agents’ model providers. Completion notices wait until the sender is idle. Sender identification comes from the tool process’s `PASEO_AGENT_ID`; without it there are no reply instructions or finish notifications. The README notes that Codex does not pass that variable to its MCP servers.
