Workspace Snippets runs commands in terminal tabs of your workspace: the scripts from a project's `package.json`, plus shell commands you save yourself. It requires Paseo 0.10.2 or newer.

Each snippet is scoped either to a project, where it is shared by every worktree of that project, or to a single workspace directory. Scripts are detected from the root `package.json` only, so scripts in monorepo subpackages are not listed. They run with the package manager the project declares or its lockfile indicates (npm, pnpm, yarn or bun).

Commands are typed into an interactive shell in the workspace terminal, so they run with the same shell authority as a terminal you open yourself on that host. Snippets are stored as unencrypted JSON in plugin settings shared across the whole host, so do not put secrets in them.

The status shown for an entry only reflects whether its terminal tab is open. It does not show whether the command finished or what its exit status was.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-workspace-snippets).*
