Command Code provider adds the `commandcode` command-line coding agent as an agent provider. Each prompt runs the CLI headless in the agent's working directory and streams its output into the timeline. It requires Paseo 0.8.0 or newer.

The CLI must already be on the daemon host and logged in with `commandcode login`. The plugin does not handle credentials, and the CLI binary can be changed in settings. Models come from the CLI, and agents can run in Build or Plan mode.

Every turn passes `--trust`. Full auto is a per-agent setting, off by default. When on, the plugin also passes `--yolo --tools-all`, which skips all permission checks and lets the agent write files and run shell commands without asking.

Attached images are written to a private temporary file for the turn and deleted afterward, and other attachment types are not forwarded. The plugin lists and replays existing sessions by reading the transcripts the CLI keeps under `~/.commandcode/projects`.

Steering a running turn is not supported, interrupt stops the CLI process, and interactive-only CLI features are not available headless. What the CLI sends over the network is up to the CLI.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/commandcode-provider).*
