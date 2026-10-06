OMP adds an agent provider for the OMP coding agent, plus an OMP sidebar and workspace panel for configuring it. Choose **OMP Plugin** when you create an agent, and Paseo runs OMP's RPC mode on the daemon host and maps its prompts, images, steering, tool permissions, subagents, session history and conversation rewind into Paseo. It runs alongside Paseo's bundled `omp` provider, does not change it, and does not migrate existing `omp` agents. The plugin is described as an alpha preview, so sessions created by an earlier preview may need to be re-imported after an upgrade.

## Setup

- Paseo 0.9.2 through 0.9.x, 0.10.x or 0.11.x.
- OMP 18.1.15 or newer on the daemon host, speaking RPC protocol v2. Older or v1-only runtimes are rejected before a session opens.
- The command defaults to `omp` and can be changed per provider with the `command` provider option or the `OMP_COMMAND` environment variable. Other provider options cover literal environment values, inherited environment variable names, an output redaction mode, session directory, RPC timeout and role models.
- Named profiles: at startup the plugin registers an **OMP · <profile>** provider for each lowercase profile directory under `~/.omp/profiles/` (or `PI_CONFIG_DIR`). Reload the plugin after adding one.

## What the sidebar and panel do

- Browse and edit OMP's native scalar settings and project configuration, for the selected store (the daemon default or a named profile).
- Manage OMP-native plugins: list, install, uninstall, enable, disable and configure them through the `omp plugin` commands.
- Show quota and usage history, memory facts, hub processes with their logs, and OMP session history, and generate a bounded support report under Help.
- Choose which composer pills appear. The preference is shared by clients connected to the same host.
- An **MCP** composer control runs OMP's own MCP management commands in the current session. Authorization prompts appear in the chat timeline, and sign-in links open in a Paseo Browser tab or on the current device.

## Reads and sends

- Starts the OMP command as a child process on the daemon host for each runtime and for availability checks. Whatever OMP, its models and its tools produce is passed to Paseo unchanged apart from validation and length limits.
- Reads from the OMP store on the host (the agent directory, XDG data and state directories, or `OMP_PROFILE`-selected profile): settings and configuration files, session transcripts, a read-only SQLite quota history, a read-only memory database, and hub state under `~/.omp/run/daemons`.
- Writes OMP's settings file when you edit settings in the panel.
- Saves images to private temporary files, removed afterward, when the selected model cannot take images directly.
- The default `outputRedaction` mode is `none`. The `configured-values` mode replaces literal values of configured credentials and of inherited environment variables, on a best-effort basis. Do not put credentials in prompts or tool output.
- Opens only validated http and https links, through Paseo.

## Limits

- Not supported: structured output schemas, archive and unarchive, revert of files or of both conversation and files, and exact MCP tool pre-approval policy. Requests for these fail visibly.
- Live approval-mode changes need a new session, and non-empty session settings are rejected.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-omp).*
