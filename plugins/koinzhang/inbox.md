Inbox is a personal inbox inside Paseo for starring agents, writing notes and capturing scratch text from an agent's composer without sending it to the agent. It adds an **Inbox** page to the sidebar and an **Inbox** panel in a workspace's Explorer.

A starred agent stays in the Inbox after it is archived, and you can unarchive it from there, which restores its archived workspace first when needed. Items can be tagged with a project and a workspace, and the workspace panel shows the items tagged with that workspace or only with its project. Projects are identified by their git remote URL, so worktrees of one repository share a project.

Inbox needs Paseo 0.9.0 or newer and a daemon Node.js runtime that provides `node:sqlite`, because it stores everything in a SQLite database. The path is fixed at `~/.paseo/plugin-data/inbox/inbox.db` (the plugin ignores `PASEO_HOME`), so each daemon host has its own Inbox. The database holds item text, tags and, for starred agents, a snapshot of the agent's title, provider, model, workspace and working directory.

The plugin reads the host's agents, workspaces and projects, an agent's latest prompt and reply from its timeline, and runs `git` in project directories to find each project's remote URL. Unarchiving uses a second connection from the plugin to the local Paseo daemon, found through the daemon's listen address and authenticated with `PASEO_PASSWORD` when one is set.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/inbox).*
