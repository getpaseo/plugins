Inbox is a personal inbox inside Paseo for starring agents and keeping notes. It adds an **Inbox** page to the sidebar and an **Inbox** panel in a workspace's Explorer. Type `/inbox <text>` in an agent's composer to save the text as a note without sending it to the agent, or `/inbox` alone to star the current agent.

Each note can be pinned, copied to the clipboard, sent into the focused agent's composer or deleted. Send inserts the note text beside any existing draft and does not start a turn. A filter menu narrows the list by agents or notes, projects and workspaces. Changes made on one client refresh the Inbox on other clients connected to the same host.

A starred agent stays in the Inbox after it is archived, and you can unarchive it from there, which restores its archived workspace first when needed. Items can be tagged with a project and a workspace, and the workspace panel shows the items tagged with that workspace or only with its project. Projects are identified by their git remote URL, so worktrees of one repository share a project.

Inbox needs Paseo 0.17.4 or newer and a daemon Node.js runtime that provides `node:sqlite`, because it stores everything in a SQLite database. The path is fixed at `~/.paseo/plugin-data/inbox/inbox.db` (the plugin ignores `PASEO_HOME`), so each daemon host has its own Inbox. The database holds item text, tags and, for starred agents, a snapshot of the agent's title, provider, model, workspace and working directory.

The plugin reads the host's agents, workspaces and projects, an agent's latest prompt and reply from its timeline, and runs `git` in project directories to find each project's remote URL. Unarchiving uses a second connection from the plugin to the local Paseo daemon, found through the daemon's listen address and authenticated with `PASEO_PASSWORD` when one is set.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/inbox).*
