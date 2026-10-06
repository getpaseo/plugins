S/ash lets you define your own slash commands for the Paseo composer and manage them in a "S/ash console" sidebar screen. A command sends a prompt template to the current agent, opens a plugin screen, or runs a named operation on the daemon host. It requires Paseo 0.8.0 or later.

Commands appear with a configurable prefix (`slash-` by default), and the console can export and import them as a bundle. The built-in commands are `review`, `console`, `ping` and `orchestrate`.

Operations are limited to the ones in the plugin's operation list, and you extend that list in settings. `ping` and `echo` run locally. `orchestrate` posts the calling agent's id to a configured endpoint, which is expected to hand the orchestrator role to that agent, and HTTP operations you declare call whatever `http` or `https` address you give them, from the daemon host. Both default to a local endpoint unless you configure another.

Calls that need authentication send a bearer secret, which the plugin reads from a configured secret file, an environment variable or a default file in your user home directory. The settings hold the secret file's path, and the secret itself is not stored in settings. Whoever runs a configured endpoint receives that secret, so point operations only at services you trust.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/slash).*
