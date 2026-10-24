Adds a **Connectors** page to Paseo for managing MCP servers (Paseo's interface calls them connectors). You can add connectors from a gallery, see which ones are broken or need sign-in, and copy them between your AI apps. Requires Paseo 0.9.0 or later.

The interface distinguishes “Everywhere” user settings from “This project” settings. Claude Code’s per-project “just for you” entries are shown read-only; removing those uses Claude Code itself, with a command you can copy or send to a selected chat after reviewing it.

It reads and writes the user-level MCP config of Claude, Codex, Kimi, and Grok, and project `.mcp.json` files. A private backup is made before config writes, and you can preview changes before saving. If another program changes a file during a save, the plugin refuses the write or reports a change detected immediately afterward; it does not roll back over newer data. Reveal to edit loads the real values, while hiding them discards that editing buffer. Copying to your other AI apps never overwrites or removes an existing connector, but a connector that has a key saved in its config is copied with that key, and the preview says so. Secrets are masked by default, and you can choose to reveal them or include them when exporting.

Sign-in features use the `claude` or `codex` CLI, which must be installed on the host. The plugin also reads Codex's credential files, and runs `codex mcp list --json`, to show sign-in state.

Health checks run in the background by default and can be turned off. For HTTP connectors they contact the endpoints you configured, with the headers you configured, and list their tools. For connectors that run a local command, they only check that the command exists and do not start it.

Adding a gallery connector shows the endpoint or command and the settings files it will change before confirmation. Local connector commands, including npm-based commands, are run later by the AI app that loads them. Review the publisher and command before adding one.

The workspace and chat panels read agent records and bounded chat timelines to show loaded and used connectors. They read the host process table to show running servers. Turning off unused connectors is confirmed and affects new sessions; the panel also exposes Paseo’s built-in tool settings through the daemon configuration API.

The gallery is loaded from `raw.githubusercontent.com/itsjustanks/mcp-gallery`. The official MCP Registry (`registry.modelcontextprotocol.io`) is off until you enable it, and you can add your own libraries by address or file. The plugin can also add a project's `.mcp.json` connectors to new agents. This is off by default, and when on it by default skips connectors with keys written into their settings. It reads AI Router's routing settings, if that plugin is installed, to estimate context cost.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-mcp).*
