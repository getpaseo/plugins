Activity shows how you use Paseo across all workspaces (sessions, prompts, providers, models, projects, and the skills and MCP tools you use most) and adds a panel for managing the agents and terminals in the current workspace. It adds a sidebar page, an Explorer panel, an agent panel, and two composer pills.

## What it reads and stores

Activity reads each agent's timeline through Paseo, including past agents, and records counts in a local database under `~/.paseo/plugin-data/activity/` on the daemon machine. For each tool call it keeps the tool name, the shell command or file path involved, and the skill or MCP server and tool. For each prompt it keeps the agent, workspace, provider, model, and time, but not the prompt text. The plugin's own code makes no network requests.

To attribute MCP calls it reads the saved agent records under `~/.paseo/agents` and OpenCode config files to extract MCP server names, and checks `~/.paseo/config.json` for whether Paseo injects its own MCP server. It does not use any server's credential fields. It also looks for `SKILL.md` files in the usual per-tool skill folders. The skill reader opens only files named `SKILL.md` in those folders.

## What it changes

Archive in the Explorer panel archives the agent in Paseo, and closing a terminal kills it. Unarchive runs `paseo agent reload <agent id>` on the daemon machine, so `paseo` must be on the daemon's `PATH`.

## Limits

- Data is per daemon. Nothing is combined across hosts.
- A tool call that does not report a model or skill cannot be attributed for that dimension, and skill matching is heuristic.

Requires Paseo 0.9.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/activity).*
