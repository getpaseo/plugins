Agent Crew adds an Explorer panel that shows the managed agents in a workspace as a tree, so you can see which agent is working, which needs you, and which failed. Open it from **New tab** in Explorer, or with **Open Agent Crew** in the Command Center.

Rows are grouped by parent and child. A child agent that runs in another workspace stays in its crew, and a parent from another workspace appears dimmed as context only. Each row shows the provider and model, workspace, last error, state, and time since activity. You can filter by Needs input, Failed, Working, Ready, Idle, and Closed, and search by title, agent ID, provider, model, directory, workspace, and label. Archived agents are left out.

## Actions

Every action that changes something opens a confirmation dialog first.

- **Open** goes to the agent. **Expand or collapse** only changes the view.
- **Nudge** sends a follow-up message to an idle or waiting agent.
- **Interrupt and redirect** sends a new direction to a running agent. The default stops the current turn first. **Prefer steering** asks the provider to take the message into the running turn, and a provider that cannot do that replaces the turn. Paseo does not report which happened.
- **Detach** removes a child from its parent so it keeps running on its own.
- **Archive** stops and removes the agent. Descendants in the same workspace may be archived with it, and descendants in other workspaces may detach and continue. The dialog says which before you confirm.
- **Allow or Deny** answers a pending permission request, one request at a time. Nothing is approved automatically.

## Settings and sidebar

**Auto open** is off by default. When you turn it on in the plugin's settings screen, the panel opens once for each new workspace the daemon sees afterward. The workspaces it has already opened are recorded in `plugin-data/agent-crew/auto-open.json` under the Paseo home directory, so reconnecting does not reopen them. Workspaces that existed before you enabled it are not opened.

On Paseo 0.11 and later, an **Active crews** row in the sidebar counts crews with a member that is working or waiting for input, and lists them with their workspace. Hide it in Settings > Sidebar. Paseo 0.9 and 0.10 do not support sidebar items, so the row is absent there.

## What it reads

It reads the daemon's agent and workspace lists through the plugin SDK, up to 2,000 agents, and refreshes on live updates plus a 30-second timer. The plugin's own code makes no network requests. If the daemon has more than 2,000 agents, the panel warns that agents in this workspace may be missing.

## Limits

- Managed Paseo agents only. A provider's own subagents are not visible to plugins.
- Agents with no workspace are not shown in any workspace's crew, unless they descend from a visible agent.

Supports Paseo 0.9, 0.10, and 0.11.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agent-crew).*
