Adds a **Be concise** page, workspace panel and composer pill to Paseo for [be-concise](https://github.com/yannelli/be-concise), a Claude Code and Codex plugin whose hooks reject or flag wordy agent edits. Requires Paseo 0.9.0 or later and be-concise 0.7.0 or later on the daemon host.

It shows be-concise's recorded hook decisions with their requests and responses, lets you turn enforcement off per workspace, edits be-concise's user and project configuration and its dictionary of flagged terms, and previews what a hook would decide without running a command or writing a file. It reads be-concise's saved activity and project records from the daemon's home directory.

If be-concise is not installed, you can install, update or remove it from the plugin after it shows the release. The plugin clones the release you choose from `github.com/yannelli/be-concise` and registers it through the `claude` or `codex` CLI, so the host needs Git and the CLI for the agent you use. Release metadata is read from `api.github.com`, and nothing is installed without you pressing the action. Replacing an existing be-concise source needs a second confirmation.

The plugin loads the installed be-concise code into the daemon and runs it, so that code runs with the daemon's access.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-be-concise).*
