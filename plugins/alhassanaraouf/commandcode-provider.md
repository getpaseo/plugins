Command Code provider adds Command Code, the `commandcode` command-line coding agent, as an agent provider in Paseo. Pick "Command Code" when you create an agent, and each prompt runs the `commandcode` CLI headless in the agent's working directory, with the CLI's text, thinking, tool calls, and token usage streamed into the timeline.

The manifest requires Paseo 0.8.0 or newer.

## Setup

The Command Code CLI must already be installed on the daemon host and logged in (`commandcode login`). The plugin does not install it or handle credentials. When a session opens, it runs `commandcode --version`, and if that fails the session shows a notice naming the binary it tried and suggesting `login` or `status`.

The plugin looks for `commandcode` on `PATH`, or `cmdc` on Windows. To use a different binary, alias, absolute path, or wrapper script, either:

- set **CLI binary** in Settings, under Command Code (a host setting), or
- set the `COMMANDCODE_CLI_COMMAND` environment variable, either on an agent (used for that agent's turns and `/` commands) or in the daemon's environment. The variable takes priority over the setting.

## What you can do

- **Models**: the model list comes from `commandcode --list-models` and is cached for an hour.
- **Modes**: Build, and Plan, which passes `--plan`.
- **Thinking effort**: low, medium, high, or max. It is unset by default, because valid levels differ by model. If the CLI rejects the effort for a model, the plugin retries the turn once without it and hides the Thinking option for that model.
- **Full auto**: a per-agent setting, off by default. When on, the plugin passes `--yolo --tools-all` to the CLI, which skips all permission checks and lets the agent write files and run shell commands without asking. Every turn also passes `--trust`.
- **Tasks**: the CLI's task tools (`task_create`, `task_update`, `task_list`, `task_get`) feed the Tasks pill.
- **Images**: attached images are written to a private file in the system temp directory and referenced in the prompt by path, and the file is deleted when the turn ends. Images over 16 MiB are dropped with a warning, and the model must support vision. Other attachment types are not forwarded.
- **Slash commands**: `/status`, `/info`, `/models`, `/mcp-list`, `/taste-list`, `/taste-learn [path|owner/repo]`, `/skills-list`, `/skills-add <owner/repo>`, `/mods-list`, and `/mods-add <source>` run the matching CLI subcommand and show the output as a notice. Skills reported by `commandcode skills list` also appear in the `/` menu and run as an agent turn. `/skills-add`, `/mods-add`, and `/taste-learn` pass your argument to `commandcode skills add`, `commandcode mods add`, and `commandcode taste learn`. The plugin does no fetching or installing itself, and what the CLI does with that argument is up to the CLI.
- **Sessions**: the CLI's session id is stored so a conversation resumes with `--session`. The plugin lists and replays existing sessions by reading transcripts under `~/.commandcode/projects`.

## Limits

- Steering a running turn is not supported, so wait for it to finish. Interrupt stops the CLI process.
- Interactive-only CLI features (`/usage`, `/login`, `/connect`, IDE setup) are not available headless.
- CLI processes inherit the daemon's environment plus any variables set on the agent. The plugin itself makes no network requests. What the CLI sends over the network is up to the CLI.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/commandcode-provider).*
