Context Mode connects Paseo agents to [Context Mode](https://github.com/mksglu/context-mode), a separate tool that runs as an MCP server and gives agents `ctx_*` tools for searching and indexing project knowledge. The plugin bundles Context Mode 1.0.169, adds it to new agents automatically, and gives you a Context Mode screen with its health, savings, and a knowledge search and indexing panel.

It supports agents running on the Claude, Codex, Copilot, Cursor, OpenCode, Pi, and OMP providers. Agents on any other provider are left unchanged. The manifest accepts Paseo 0.9, 0.10, and 0.11, and the plugin needs Node.js 24 or later on the daemon host.

## What it adds to agents

When automatic activation is on (the default), creating a supported agent adds a stdio MCP server named `context-mode` to the agent's MCP servers, launched with the Context Mode runtime and with two environment variables set: `CONTEXT_MODE_PLATFORM` and `CONTEXT_MODE_DIR`. Opening or resuming a session sets the same two variables.

- The MCP server is added only when an agent is created. Existing agents do not get it, so recreate an agent to give it the tools. Opening or resuming any session of a supported provider sets only the two environment variables.
- An MCP server you already named `context-mode`, and any explicit `CONTEXT_MODE_PLATFORM` or `CONTEXT_MODE_DIR` you set, are kept as they are.
- Each provider gets its own storage folder, for example `.claude/context-mode` under the Claude config directory or `.codex/context-mode` under `CODEX_HOME`. Existing folders are reused, and session data is never merged across providers.
- With "Prefer native integrations" on (the default), the plugin checks the provider's config files for an existing Context Mode registration and skips its own injection when it finds one, so agents do not get duplicate tools. The health strip at the top of the screen shows, per provider, whether activation is native, MCP, or disabled.

## The Context Mode screen

On Paseo 0.11 it is a screen with a sidebar row showing Healthy, Failing, or Checking. On Paseo 0.9 and 0.10 it is a sidebar surface. A Context Mode button also appears on each active agent's composer, and the Command Center has an "Open Context Mode" item. Above the tabs, the health strip shows the runtime version and how many providers are covered. It has three tabs:

- **Savings**: Context Mode's stats and health, plus a dashboard built from its local databases: lifetime savings, activity, categories, and indexed sources across provider storage folders.
- **Knowledge**: search indexed knowledge for a chosen provider and project, index a local file or directory, fetch and index an HTTP or HTTPS URL, and purge indexed knowledge. A purge needs the provider, project path, and scope (the project or one session), then a review step and a second confirmation. "Open Insight" opens https://context-mode.com/insight in your browser.
- **Setup**: a Run doctor button that runs Context Mode's `ctx_doctor` check for a provider. The install and upgrade actions in this tab only display a command for you to review. The plugin never runs it.

## Settings

Settings are saved on the host and shared by every client connected to it.

- **Binary lookup**: "Configured path, PATH, then bundled" (default) or "PATH, then bundled". The daemon tries an absolute path you set, then `context-mode` on its `PATH`, then the bundled runtime.
- **Absolute binary path**: optional override. It must be an absolute path.
- **Automatically activate Context Mode**: on by default. Turn it off and the plugin stops adding the MCP server and the two environment variables to agents and sessions from then on. It does not remove them from agents that already have them.
- **Prefer native integrations**: on by default, described above.
- **Refresh interval**: 5, 15 (default), 30, or 60 seconds. The Context Mode screen refreshes at this interval.

## What it reads, runs, and sends

- It starts the Context Mode process on the daemon host, without a shell, for health checks, stats, doctor, search, index, fetch, and purge. Calls time out after 15 to 120 seconds depending on the tool, and output is capped at 192 KiB.
- It reads Context Mode's SQLite databases read-only in the provider storage folders under your home directory (and `CONTEXT_MODE_DIR` or `CONTEXT_MODE_DATA_DIR` if set) to build the savings dashboard. It reads the provider config files named above, up to 1 MiB each, to detect native integrations.
- Indexing a path reads files under that absolute path on the host into Context Mode's knowledge store. Fetching a URL makes Context Mode download that page from the host.
- The plugin itself makes no other network requests. What the agents' Context Mode tools do is up to Context Mode.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/context-mode).*
