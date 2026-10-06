9Router adds a sidebar page for managing a [9router](https://github.com/decolua/9router) instance from Paseo, and a **9Router** provider that runs Claude-style sessions through it. 9router is a separate program that pools your Claude, Codex, and other model accounts behind one local address. 9router must already be installed and running on the Paseo host. This plugin does not install or update it, except when you press **Update and restart** (below).

## Setup

1. Open **9Router → Guide & Setup → Host setup** and save the router's dashboard URL and password. The plugin stores them, with the router API key it uses, in `~/.agent-link/9router.json` on the daemon machine. That folder is created private, and an unreadable existing file is left as it is.
2. Under **Accounts**, connect Claude or Codex. Sign-in happens in your normal browser.
3. Under **Models**, search the catalog, optionally pick a shortlist, then run **Sync into Paseo**. Start a new agent and choose the **9Router** provider.

The plugin's own HTTP requests go to the router address you save, and it acts on whichever Paseo host you selected. It also reads the process list (`ps`) to report the router's uptime, and keeps that history in `~/.agent-link/9router-uptime.json`.

## What the sidebar page does

- **Accounts:** quota windows, spend caps, health, holds, rotation and priority, and sign-in. Removing an account asks for confirmation, and parking one keeps its credentials but takes it out of rotation.
- **Models:** the full catalog with search and sorting. **Test** sends a real request to a provider and uses quota. Browsing does not.
- **Usage & Health:** token and estimated-cost totals by day, session, project, workspace, and model. These come from the Claude Code and Codex transcript files on the daemon machine (`~/.claude/projects`, `~/.codex/sessions`, and archived Codex sessions), including sessions that never went through 9router. Message text and tool output are not kept, and costs are estimates at base API prices.
- **Routing & Access, Setup:** CLI routing, API keys, fallback combos, token-saving settings, a feature directory, and a helper for reaching a remote router's dashboard.

Each agent also gets a **9Router** tab showing whether it runs through the router and the state of its account pool. A composer pill appears only when something needs attention, such as accounts resting, none ready, or the router offline.

## What it changes

**Paseo's provider list.** **Sync into Paseo** writes a `ninerouter` provider into Paseo's config. It extends Claude, points at the router address, and includes the router's API key in that provider's environment. It also removes provider entries named `agent-link`, `claude-auto`, `codex-auto`, `agent-router`, and `ninerouter-codex` if they exist, and renames leftover helper files that earlier versions installed in `~/.agent-link/bin`. Sync also checks the built-in `claude` and `codex` providers: if a provider's `additionalModels` list is not empty and every entry's ID is in the router's current model list, it replaces that list with an empty one, whoever wrote it. A list with any ID the router does not report is not touched. Nothing else in those providers is changed.

**Per-agent routing (off by default).** Under **Settings → Plugins → 9Router → Routing**, **Route Paseo agents through 9router** makes every Claude session Paseo starts or resumes (including the 9Router provider) get the router's URL, API key, and default model names in its environment. Codex sessions are not touched. Terminal Claude Code outside Paseo keeps its direct connection.

**Automatic backoff reset (on by default).** When an agent's turn fails with a rate-limit or "no available account" error, the plugin clears backoff on the accounts that can serve that model. **Retry the turn after a reset** (off by default) then sends "Retry the last request." to the agent, up to **Automatic retries per agent**. A background check every 10 minutes (configurable from 2 minutes to 2 hours) reads account health from the router and logs accounts that are stuck.

**Machine-wide CLI routing (button, with confirmation).** The Routing section can send Claude Code or Codex through the router for every process on the host. It asks 9router to rewrite those tools' own configuration (`~/.claude/settings.json` and `~/.codex/config.toml`), using 9router's own CLI-tools feature. **Restore** reverses it, and for Claude the plugin also removes leftover `ANTHROPIC_DEFAULT_*` model entries that still point at router models. Both directions change what every session of that tool on the host connects to.

**Optional actions.**
- **Add GPT-6 Astra** registers a model, alias, and picker entry in 9router.
- **Start** launches the `9router` program on the daemon machine. **Stop** and **Update and restart** ask the running router to shut down or to replace its installed package and restart, which interrupts routed traffic.
- **Maintenance fixes** edit 9router's installed files after you apply them, keep backups, and are undone when 9router's installed package is replaced.
- **Tailscale, tunnel, and SSH helpers** change the router's tunnel settings, or run `ssh -L` from the daemon machine to forward a remote router's dashboard. The SSH helper needs working keys and cannot enter a password.

## Limits

- Router figures cannot be split by workspace, because every Paseo session shares one key. Transcript-based usage can.
- Readiness shown in the catalog is the router's reported account state, not proof a request succeeds.
- A Claude agent shows "Direct provider" in its tab even when routing is on, because the client cannot see the environment injection. Choose the 9Router provider to get a "Via 9Router" verdict.
- Account credentials stay in 9router. API key lists show the last four characters, and copying a key puts the full value on your clipboard.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agent-link-9router).*
