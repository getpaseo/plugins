Inbox is a personal inbox inside Paseo. You can star agents to keep them within reach, write notes, and capture scratch text from an agent's composer without sending it to the agent. Everything lives on the Paseo host in one list, shown on an **Inbox** page in the sidebar and as an **Inbox** panel in a workspace's right-hand Explorer.

## What you can keep

- **Starred agents.** Use Command Center → *Add agent to Inbox*, or type `/inbox` with no text in an agent's composer. A starred agent stays in the Inbox after it is archived. *Unarchive* restores it, restoring its archived workspace first when needed. The detail view shows the agent's latest user prompt and latest reply, read from its timeline.
- **Notes.** Command Center → *New Inbox note*, or *+ Note* on the Inbox page. Notes are plain text or Markdown and autosave.
- **Scratch.** Type `/inbox <text>` in an agent composer. The text is saved as scratch, tagged with the current project, and nothing is sent to the agent. You can convert scratch to a note later.

## Tags and views

- Every item can carry a project tag and a workspace tag. On a note or scratch, tap the tags in its detail to change them. A workspace must belong to the tagged project, so while a workspace is set other projects are unavailable, and choosing only a workspace sets its project. A starred agent is tagged with its own workspace and project.
- Projects are identified by the git remote URL (`origin`, otherwise the first remote), then the repository root, then the directory, so worktrees of one repository share a project.
- The workspace Inbox panel shows items tagged with that workspace plus items tagged only with its project. It is a filtered view of the same Inbox, and a note added in the panel is tagged with that workspace. An Inbox icon in the workspace header opens the panel.
- On the Inbox page, workspace and project chips appear on the *Agents* tab and narrow the list. The selection is kept as a host setting.
- The sort button next to *+ Note* cycles through updated time (the default), starred time, created time and name. Pinned items stay on top.
- Items for archived projects and workspaces remain, with their tags struck through until they are restored.

## Requirements and what it touches

- Paseo 0.9.0 or newer, and a daemon Node.js runtime that provides `node:sqlite`. Without it the plugin cannot open its database.
- Data is stored per host in `~/.paseo/plugin-data/inbox/inbox.db`, so each daemon has its own Inbox. The plugin stores the item text, tags, and for starred agents a snapshot of the agent's title, provider, model, workspace and working directory.
- It reads the host's agents, workspaces and projects through Paseo's API and runs `git` in project directories (with a 5 second timeout) to find each project's remote URL.
- Unarchiving an agent uses a second connection from the plugin to the Paseo daemon. The plugin finds the daemon address through `PASEO_LISTEN`, then `paseo.pid` in the Paseo home, then `127.0.0.1:6767` (or `PORT`), and uses `PASEO_PASSWORD` when set.
- The plugin is trusted, unsandboxed code that runs on the daemon.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/inbox).*
