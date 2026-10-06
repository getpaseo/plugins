Terminal integration lets you run the code blocks in an agent's replies in a Paseo terminal or in the background, and send the output back to the agent. It can also attach the output of any terminal on the daemon to a prompt. It requires Paseo 0.10.1 or later.

Nothing runs until you press a run control on a block or submit `/run <command>`. Commands run on the daemon host with your user's permissions, which needs macOS or Linux with `bash`, plus `python3` or `node` for those block types. A normal run types the block into a terminal tab named "Agent commands" and uses that terminal's environment. A background run is a hidden process that inherits the plugin's environment and has no stdin, so a prompt for a password or confirmation fails instead of waiting.

By default, when a run finishes, the command, exit code and output are sent to the agent as a new message, with long output trimmed. A setting controls that default, and another option, off by default, adds command guidance to the system prompt of newly created agents. The terminal-output attachment reads the contents of terminals across all workspaces on the daemon, and the plugin makes no network requests of its own.

After six hours the plugin stops watching a terminal run and marks it failed, but the command keeps running in the terminal until you stop it, while a background run is killed at that point.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/terminal-integration).*
