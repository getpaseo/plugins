Workspace Activity adds two panels that show what the agents in one workspace are doing: **Agent Monitor** and **Tasks**. Both open as workspace tabs or docked in the Explorer, from the Command Center, or with `/agents` and `/tasks` in the composer.

**Agent Monitor** shows every agent in the workspace, including archived ones under an **Archived** filter, as a tree of parents and their subagents with counts of running, attention-needed, idle and archived agents. You can expand the transcript and inspect each tool call's input, output and status. **Steer** sends a prompt to a running agent, **Stop** interrupts the running turn (the agent stays alive and idle, and a later prompt resumes it), and a card action archives an agent. You can also open any agent in its own tab. These actions run only when you press them.

**Tasks** collects the todo lists that agents in the workspace emit, groups them by agent with completed and total counts, filters by status (All, In Progress, Pending, Completed) and links back to the agent thread. Both panels stay empty until an agent has run in the workspace.

## What it reads

- The plugin reads agent lists and timelines of the current workspace through Paseo's plugin interface, and reads provider subagent lists and transcripts. It has no credentials, files or network access of its own.
- Stopping a turn, listing provider subagents and reading their transcripts go through the plugin's daemon side, which sends requests to the Paseo daemon over the plugin process channel, because the plugin interface has no calls for them. Steering and archiving use Paseo's normal agent calls.
- It stores nothing.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/workspace-activity).*
