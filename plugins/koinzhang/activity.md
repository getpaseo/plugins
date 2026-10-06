Activity shows how you use Paseo and gives you a list for managing the agents in the current workspace. It adds a sidebar page, an Explorer panel, an agent panel, two composer pills, and Command Center entries for opening each view.

## What it shows

- **Sidebar page:** usage across all workspaces: sessions, prompts, top provider and model compared with the previous 7 days, a daily calendar, a 30-day histogram, an hourly timeline, provider and project rankings, and your most-used skills, MCP tools, and models. A provider filter narrows the page to one provider.
- **Explorer panel:** the agents in the current workspace as a list you can search, sort, filter by status, and archive or unarchive. Rows show live state (permission request, finished, error, running). The panel also lists the workspace's open terminals, with an output preview and a close button, plus shell, file, and prompt counts and the skills and MCP tools used there.
- **Agent panel and pills:** per-agent tool counts, with a reader for the `SKILL.md` of a skill the agent used. One composer pill summarizes the current agent's skill and MCP use. A second, **Needs attention**, appears when other agents in the workspace have finished, errored, or asked for permission.

## What it reads and stores

Activity reads each agent's timeline through Paseo, including past agents (it backfills history in the background), and records counts in a local database at `~/.paseo/plugin-data/activity/` on the daemon machine (`usage.db`, or a JSONL file if SQLite is unavailable). The plugin's own code makes no network requests.

The database keeps, per tool call, the tool name, the shell command or file path involved, and the skill or MCP server and tool. For each prompt you send it keeps the agent, workspace, provider, model, and time, but not the prompt text. The Explorer panel's "latest prompt" preview is read from the timeline when you open it.

To match MCP calls to a server, it reads the **names** of configured MCP servers from each agent's saved record under `~/.paseo/agents` and from OpenCode config files (`~/.config/opencode/` and the project's `opencode.json` or `.opencode/`). It also checks `~/.paseo/config.json` for whether Paseo injects its own MCP server into agents. It does not use any server's settings or credentials.

To label skills, it looks for `SKILL.md` files in the usual per-tool skill folders (for example `~/.claude/skills`, `~/.codex/skills`, and the matching project folders). The skill reader in the agent panel opens only a file named `SKILL.md` inside those skill folders, up to 512 KB.

## What it changes

Archive in the Explorer panel archives the agent in Paseo, and close on a terminal kills it. Unarchive runs `paseo agent reload <agent id>` on the daemon machine, so the `paseo` command has to be on the daemon's `PATH`.

## Limits

- Data is per daemon. Each machine keeps its own database and nothing is combined across hosts.
- Counts come from the Paseo timeline. A tool call that does not report a model or skill cannot be attributed for that dimension.
- Skill matching is heuristic and labeled exact, inferred, or low confidence in the panel.
- Sessions with no workspace root or working directory are grouped under **Other** in the project ranking.

Requires Paseo 0.9.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/activity).*
