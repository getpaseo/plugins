9Router adds a sidebar page and a **9Router** agent provider for [9router](https://github.com/decolua/9router), a program that pools your Claude, Codex, and other model accounts behind one local address. 9router must already be installed and running on the Paseo host. This plugin manages it and routes Paseo sessions through it.

## Setup

Save the router's dashboard URL and password in the plugin's host setup, connect accounts, then run **Sync into Paseo**. New agents can then choose the **9Router** provider.

## Credentials and config writes

- **Router credentials:** the dashboard URL, dashboard password, and a router API key are stored in `~/.agent-link/9router.json` on the daemon machine (created private). Provider account credentials stay in 9router.
- **Paseo config:** Sync writes a `ninerouter` provider into Paseo's config, with the router URL and API key in that provider's environment. It removes provider entries `agent-link`, `claude-auto`, `codex-auto`, `agent-router`, and `ninerouter-codex`, and renames leftover helper files that earlier versions put in `~/.agent-link/bin` (with a `.removed-by-agent-link` suffix).
- **Model cleanup:** Sync also clears `additionalModels` on the built-in `claude` and `codex` providers when the list is non-empty and every entry's ID is in the router's current model list, whoever wrote it. A list containing any ID the router does not report is left alone.
- **Per-agent routing (off by default):** when enabled, every Claude session Paseo starts or resumes gets the router URL, API key, and default model names in its environment. Codex sessions are not changed.
- **Machine-wide CLI routing (button, with confirmation):** asks 9router to rewrite Claude Code's and Codex's own configuration (`~/.claude/settings.json`, `~/.codex/config.toml`) so every process of that tool on the host goes through the router. **Restore** reverses it, and the plugin also removes leftover `ANTHROPIC_DEFAULT_*` entries that still name router models from `~/.claude/settings.json`.
- **Automatic backoff reset (on by default):** when an agent's turn fails with a rate-limit error, the plugin asks the router to clear account backoff. Automatically retrying the turn is a separate setting, off by default.

## Reads

Usage totals come from Claude Code and Codex transcript files on the daemon machine (`~/.claude/projects`, `~/.codex/sessions`), including sessions that never used 9router. Message text and tool output are not kept, and costs are estimates. Router uptime history is kept in `~/.agent-link/9router-uptime.json`.

## Maintenance and remote actions

All of these run only when you press them. The plugin's HTTP requests go to the router URL you save.

- **Start** launches the existing `9router` program on the daemon machine with its update check skipped. **Stop** asks the running router to shut down, which interrupts routed traffic.
- **Update and restart** sends the configured router an update request (`POST /api/version/update`). The router carries out the update, and that code is not part of this plugin.
- **Update Claude Code** runs the installed `claude update` command on the daemon machine.
- **Patch fixes** rewrite 9router's installed files in place (keeping local backups) so its advertised Claude Code version matches yours or to correct two known router bugs. A reinstalled 9router loses them.
- **Remote dashboard:** the plugin can run `ssh -L` from the daemon machine to forward a remote router's dashboard (it needs working keys and accepts new host keys), and can ask the router to turn its tunnel or Tailscale publishing on or off.

## Limits

Router usage cannot be split by workspace, since every Paseo session shares one key. The transcript-based totals can.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agent-link-9router).*
