Customize shows, on one board, what a coding agent provider will pick up from your local configuration for a project: instructions, rules, skills, MCP servers, commands, subagents, and plugins, split into Project and User sections. It is read-only. The plugin requires Paseo 0.9.0 or newer.

It scans the project's directories and your home directory on the daemon host, including MCP config files that may contain secrets. Previews mask MCP environment and header values, secret-looking arguments, and URL query parameters such as tokens. To show provider versions, it runs each provider's CLI with `--version` on the host, and it reads a few daemon environment variables and, for Cursor on macOS, Cursor's local state database read-only.

Open and Reveal only accept paths a scan returned and ask the daemon host's operating system to open the file or show it in the file manager, so they act on the host and not on the device you are viewing from. Each scan is saved as a private file in the plugin's data folder so the board shows the last result after a restart.

The board is a snapshot of files on disk and can differ from what a running agent uses, because trust settings, plugin enablement, command-line flags, and CLI versions also change that.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/customize).*
