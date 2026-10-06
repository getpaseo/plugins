Adds a **Connectors** page to Paseo for managing MCP servers (Paseo's interface calls them connectors). You can add connectors from a gallery, see which ones are broken or need sign-in, and copy them between your AI apps. Requires Paseo 0.9.0 or later.

It reads and writes the user-level MCP config of Claude, Codex, Kimi, and Grok, and project `.mcp.json` files. A backup is made before each config write, and you can preview changes before saving. Copying to your other AI apps never overwrites or removes an existing connector, but a connector that has a key saved in its config is copied with that key, and the preview says so. Secrets are masked by default, and you can choose to reveal them or include them when exporting.

Sign-in features use the `claude` or `codex` CLI, which must be installed on the host. The plugin also reads Codex's credential files, and runs `codex mcp list --json`, to show sign-in state.

Health checks run in the background by default and can be turned off. For HTTP connectors they contact the endpoints you configured, with the headers you configured, and list their tools. For connectors that run a local command, they only check that the command exists and do not start it.

The gallery is loaded from `raw.githubusercontent.com/itsjustanks/mcp-gallery`. The official MCP Registry (`registry.modelcontextprotocol.io`) is off until you enable it, and you can add your own libraries by address or file. The plugin can also add a project's `.mcp.json` connectors to new agents. This is off by default, and when on it by default skips connectors with keys written into their settings. It reads AI Router's routing settings, if that plugin is installed, to estimate context cost.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-mcp).*
