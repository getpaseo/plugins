DeepSeek Harness adds a provider to Paseo so you can pick **DeepSeek Harness** when you create an agent. The agent runs through the DeepSeek Harness command line tool (`dsh`) on the daemon machine, and Paseo shows the conversation in its normal agent view. The plugin has no screens of its own.

## How it works

For each session the plugin starts `dsh --profile acp` as a child process, without a shell, and talks to it over the Agent Client Protocol. Paseo handles prompts, permission requests, usage and the timeline. The plugin passes the session's working directory, environment variables, configured MCP servers and images to `dsh`.

Model and reasoning-effort choices come from the models `dsh` reports, so they follow your DeepSeek Harness profile, and the model picker may show opaque model IDs. When you resume a session, `dsh` restores its own context and Paseo keeps the displayed history, so old messages are not replayed. If a resume fails, the plugin reports the error and does not start a new session.

## Setup

- DeepSeek Harness must be installed on the daemon machine and the daemon must find `dsh` on its `PATH`. Before each start the plugin runs `dsh --version` (5 second timeout) and refuses to start if the version is below 0.1.5-rc.1 or cannot be read. Any version at or above 0.1.5-rc.1 passes, with no upper limit.
- The daemon needs Node.js 22.19.0 or newer.
- Configure your DeepSeek API key in DeepSeek Harness itself. The plugin does not install, update or configure `dsh`, and it does not read `dsh` credential files.

Two environment variables, read from the daemon's environment:

| Variable | Default | Effect |
| --- | --- | --- |
| `DSH_PASEO_COMMAND` | `dsh` | Path to the executable to run. It is a path, not a shell command. |
| `DSH_PASEO_PROFILE` | `acp` | Profile passed to `dsh`. An override must still speak ACP over stdio. |

Set them where the daemon starts. Setting them in an unrelated terminal does not change a running daemon.

## What to know

- The plugin is trusted, unsandboxed code, and `dsh` runs tools as your operating system user. The plugin adds no sandbox and no permission-policy override.
- The plugin makes no network requests and stores nothing itself. The `dsh` process it starts talks to DeepSeek.
- Provider commands (slash commands handled by the provider) are refused.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/deepseek-harness).*
