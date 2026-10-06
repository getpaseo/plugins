Agent monitor adds one roster of every agent on a host, so you can see which ones need you without walking the workspace tree. It adds an **Agent monitor** screen to the sidebar and an **Open agent monitor** item to the Command Center. On Paseo 0.11 the sidebar row also shows a badge counting the agents that need attention.

Agents are grouped by project, then by workspace, with counts and filters for four buckets: Attention, Running, Idle and Closed. Attention covers agents that require attention, are in an error state, or have a pending permission request. Each row shows a status dot, state and wait time, model and last error, parent rows show their subagent count, and workspace headers show their added and removed line counts. A text filter searches title, agent id, provider, model, working directory, project and workspace. Selecting an agent or a workspace header opens it.

## Settings

The gear beside Refresh opens the monitor settings. They switch between project groups, workspace groups and a flat list, and set the agent sort order (triage, recently updated or title), density, the default bucket, whether Closed agents appear under All, and which details rows display (diffs, pin markers, model, wait age, subagent counts, last error). Preferences are stored per host and shared by every client connected to it.

## What it reads and does

The plugin reads the agent, workspace and project lists through the selected host's existing connection and opens no connection of its own. Lists refresh as agents, workspaces and projects change. The only action it performs is archiving: one agent, or every closed agent.

## Limits

- Requires Paseo ^0.9.0, ^0.10.0 or ^0.11.0. Paseo 0.9 and 0.10 get the sidebar item without the badge.
- Archive is the only lifecycle action. Interrupting a turn is not available to plugins.
- The badge popover lists up to eight agents, longest waiting first, but cannot open them. Use **Open monitor** and select the agent there.
- The badge shows `N+` once the host reaches the 2,000 agent page limit.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agent-monitor).*
