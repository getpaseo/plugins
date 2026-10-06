Bots adds personal bots to Paseo, each with its own instructions, provider and model, approval mode, memory, routines, skills, MCP servers, and connected apps. You chat with a bot in its own workspace, and a bot can run routines on a schedule or from a webhook. You can group bots into teams, where a Chief of Staff bot takes your requests and hands parts to teammates. Paseo 0.9.2 or later is required.

## Using it

- A Bots entry in the sidebar lists your bots. New bot starts blank, from a role, from a preset, or from an imported bot or team file. A bot can also propose changes to bots, teams, routines, skills, and MCP servers in a chat, and nothing applies until you press Apply changes on its card.
- Each bot keeps a `MEMORY.md` and a daily log of its chats in its folder. The Memory settings show recent changes, and Undo restores a file.
- Routines run on a preset or cron schedule, once, when a webhook is called, or manually. A scheduled or manual run is skipped while the previous run of that routine is still working. A webhook routine allows up to 3 runs at once.
- Routines run on the host that stores the bot. A bot assigned to another host records a failed run instead.
- A webhook URL listens on `127.0.0.1` on the host and accepts POST only, with a secret in the URL. It allows 10 calls a minute and rejects large request bodies.
- `/learn` in a chat has the bot write up a task as a skill, and you save it from a card.

## Setup for optional features

Bots works without either account below.

**Connected apps** use your own Composio project. Create a project key, open Skills & Tools, then press + next to Connected apps and paste it. Connect each app and sign in on Composio's page, then switch the app on for each bot. Allow-lists per app (all tools, read-only, chosen tools, one account) are enforced by a local relay that bots reach with a per-bot token.

**Generated avatars** use your own OpenAI key. Without a key the bot keeps its pixel-art avatar, or you can supply a picture URL.

## What leaves the machine

- **Composio** (`backend.composio.dev`, or the origin in `PASEO_BOTS_COMPOSIO_ORIGIN` on the host): the plugin sends the project key, a random per-install user ID, and the account and session management calls for connected apps. Tool calls bots make on an enabled app go through the local relay to Composio, including their arguments, and Composio returns results. App connections belong to that one user ID, so every bot on the host shares your connected accounts as limited by each bot's allow-list.
- **OpenAI** (`api.openai.com`): pressing Generate on an avatar sends your key and a short prompt built from the bot's name, role, description, and your visual direction, and receives a picture.
- **GitHub**: importing skills reads `api.github.com` and `raw.githubusercontent.com` for the repository you name, with limits on the number and size of files. A direct link to a raw `SKILL.md` on any host is also fetched. Imported skills stay off until you press Review and turn them on.
- **Google**: the Connected apps list loads an icon from `www.google.com/s2/favicons` for apps without a logo.
- The agents themselves use whatever provider you choose for each bot, the same as any Paseo agent.

## What it reads and writes on the host

- Bot folders, the skill library, routines, webhook secrets, and the Composio and OpenAI keys live under the plugin's folder in `plugin-data` inside the Paseo home.
- Importing MCP config reads the user-level server lists in Claude Code's `~/.claude.json`, Claude Desktop's config, and Cursor's `~/.cursor/mcp.json`, and shows each as JSON to review before adding. Those lists can include environment variables with secrets.
- Test and turn on starts a stdio MCP server as a process on the host with the daemon's environment, or contacts an HTTP server at its URL, and lists its tools.
- The Paseo tools setting under a bot's Access lets bots start agents, open workspaces and terminals, set schedules, and use the browser. Turn on there changes the setting for every agent on the host, not only bots.

The plugin runs unsandboxed in the Paseo daemon.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-bots).*
