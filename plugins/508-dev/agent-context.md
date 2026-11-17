Attach a snapshot of an existing agent's conversation to a new prompt, so a new agent can start with the context of an earlier one.

The source shows up in the composer's `+` attachment menu as "Attach agent transcript". On Paseo clients that support the New Agent shortcut, it also appears next to Import Session. Opening the picker lists up to five recent agents. Type to search by title, workspace, project, directory, provider or ID, then pick one to attach its snapshot as a removable pill.

Requires Paseo 0.9 or later. No setup, accounts or tokens are needed. The plugin only searches the host it is installed on, so install it on each host whose agents you want to attach.

What the snapshot contains:

- User and assistant messages, plus a one-word marker for each tool call (for example "Shell" or "Edit").
- No reasoning, no raw tool inputs or outputs, and no subagent logs.
- At most 128 KiB, keeping the most recent context and noting what was left out.

The snapshot is built when the picker searches. The text is stored with your draft in the app and sent to the new agent's model provider with your prompt, so do not attach conversations you would not send to that provider. Search scans up to 1,000 agents and reads up to 5,000 timeline items per result, and only lists non-archived top-level agents. Reading an inactive agent's timeline can load its retained session, but no new agent turn starts. The plugin copies no code, files, branches, terminals, permissions or provider session state, and removing a pill never deletes the source agent.
