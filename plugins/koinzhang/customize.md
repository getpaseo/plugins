Customize shows what a coding agent provider will pick up from your local configuration for a project, on one board. For the provider and project you choose, it lists instructions (AGENTS.md, CLAUDE.md and similar), rules, skills, MCP servers, commands, subagents, and plugins, split into Project and User sections and grouped by source directory. It reads files on the daemon host and does not change them.

The manifest requires Paseo 0.9.0 or newer.

## Using it

Open Customize from the sidebar or the Command Center, or submit `/customize` in an agent composer. The slash command selects that agent's provider and its workspace's project when it can, and opens the board.

- **Providers**: the picker lists the supported providers that Paseo has enabled: Claude, Codex, Cursor, Copilot, OpenCode, Pi, Oh My Pi, Cline, CodeBuddy Code, Gemini CLI, Goose, Grok Build, Kilo Code, Kiro CLI, Kimi Code, Qwen Code, and TraeCode CLI. Built-in providers are grouped above ACP providers. The Project picker lists every Paseo project.
- **Tabs**: Instructions, Rules, Skills, MCP, Commands, Subagents, and Plugins. Each starts with a note on how that provider loads the category, and which tabs appear depends on the provider. A tab marked "No scanned location" means Customize has no verified file location for that provider, not that the provider lacks the feature.
- **Status**: each entry is marked Auto, Conditional, Manual only, Needs approval, Disabled, or Not loaded, with the config key or frontmatter field that caused it. The Skills tab can filter to all, automatic, or manual-only skills.
- **Token estimates**: instructions, rules, skills, commands, subagents, and plugins show an estimated token count, calculated from the file's character counts rather than by a real tokenizer, so treat it as approximate. Skills, commands, and subagents show the always-loaded name and description separately from the body that loads when invoked. MCP servers are not counted.
- **Preview**: selecting an entry shows its first 64 KiB or 400 lines, with Open, Reveal, and Copy path. MCP previews mask `env` and `headers` values, secret-looking arguments, and URL query parameters such as `token` and `api_key`.
- **Layout and saved choices**: entries show as a list or a card grid, and the provider, project, and layout choices are saved on the host.

The result is a snapshot of files on disk. Trust settings, plugin enablement, command-line flags, and CLI versions can change what a running agent actually uses.

## What it reads, runs, and stores

- It scans project directories and your home directory (user-level config for each provider), including MCP config files that may contain secrets. Only masked MCP values appear in previews. Preview and Open accept only paths that a scan returned.
- Open and Reveal ask the daemon host's operating system to open the file or show it in the file manager (`xdg-open` or `gio` on Linux, `open` on macOS, `explorer.exe` on Windows). They act on the host, not on the device you are viewing from.
- To show provider versions, it asks Paseo's provider diagnostic first, then runs `<provider CLI> --version` on the host (for example `claude`, `codex`, `cursor-agent`, `opencode`) with a 3 second timeout. It never uses a package runner. The version also decides how OpenCode skills with `metadata.opencode/autoinvoke: false` are shown.
- The skills compatibility indicator for Cursor reads Cursor's local state database read-only on macOS (the `cursor/thirdPartyExtensibilityEnabled` key). For OpenCode it reads the `OPENCODE_DISABLE_EXTERNAL_SKILLS`, `OPENCODE_DISABLE_CLAUDE_CODE`, and `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS` environment variables of the daemon.
- Each provider and project scan is saved as a private JSON file (owner-only permissions, up to 10 MiB) in the daemon's `plugin-data/customize/` folder, so the board shows the last list after a restart. It rescans in the background when the saved scan is 10 minutes old or older, and you can press Rescan. A skill reachable through several symlinked directories appears once.
- It makes no network requests.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/customize).*
