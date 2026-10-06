Workspace Snippets runs commands in terminal tabs of your workspace: the scripts from a project's `package.json`, plus saved shell commands you write yourself. Requires Paseo 0.10.2 or newer.

You can reach it from a **Snippets** item in the sidebar, which works before any workspace is open, from a **Snippets** button in each workspace header, from "Open snippets" in the Command Center, and with the `/snippet` slash command. In the sidebar, pick a project, then run its scripts and project-scoped snippets. Run opens the project's local workspace (reusing it if one exists) and switches to it. `/snippet <name>` matches an exact snippet name first, then an exact script name, then a unique case-insensitive prefix, and lists candidates when the name is ambiguous or unknown. `/snippet` alone opens the panel.

Scripts are detected from the root `package.json` only, so scripts in monorepo subpackages are not listed. They run as `<package manager> run <script>`, with npm, pnpm, yarn or bun chosen from the `packageManager` field, then from the lockfile.

Each entry gets its own terminal tab (`script:<name>` or `snippet:<name>`). Run creates and focuses the tab, Restart sends Ctrl+C and runs the command again, Stop sends Ctrl+C, and Close closes the tab. A row can expand to show the last 40 lines of that terminal's output, refreshed every 1.5 seconds while the tab is open. The status shown for an entry only reflects whether its terminal tab is open, not whether the command finished or what its exit code was.

Snippets are scoped to a project (shared by every worktree of it) or to one workspace directory. You can reorder the project list and hide the scripts section. Snippets are stored as unencrypted JSON in plugin settings shared across the whole host, so do not put secrets in them.

Your commands are typed into an interactive shell in the workspace terminal, so they run with the same shell permissions and environment as a terminal you open yourself.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-workspace-snippets).*
