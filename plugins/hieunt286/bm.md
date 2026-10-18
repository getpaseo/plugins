Beads Management coordinates agent work by mission: one goal across the repositories it needs. Each mission has a Main (a Beads Manager), Workers in the relevant repositories, a Reviewer for larger changes, and an optional Orchestrator that governs the process at the autonomy level you choose. The dashboard provides Missions, an Inbox for decisions and alerts, Projects, Settings, and Tools & skills. Requires Paseo 0.9.0 or later on macOS or Linux.

Open Missions and choose New mission to name the goal, short code and repositories. Its Main works in a Mission-List project, with one workspace per mission, and assigns work to Workers in the selected repositories. Existing repository Managers are associated with one-repository missions during migration. Mission records, journals, shared project memory, traces and settings are stored on the daemon host. The plugin creates and labels its agent roles and mission workspaces.

Workers run without permission prompts by default (bypass mode on Claude, full access on Codex). Mains also select an available mode without permission prompts. Review changes before committing. Hold risky actions is off by default and can be enabled per project; the plugin’s policy checks are workflow guardrails, not an OS sandbox. Its local tool server uses role/agent bindings to coordinate agents. Allow agent tools is a separate, confirmed, machine-wide Paseo setting that applies to every agent.

The plugin reads project and agent metadata, timelines, repository state and its own workflow records. Mission Mains receive context across their selected repositories, and linked Workers exchange requests and replies through the plugin. This context reaches the selected agents’ model providers. The optional Orchestrator starts only when you start it, reads plugin project context with secrets masked, spends provider tokens, and coordinates process decisions. The governor also tracks mission thresholds and can send a nudge to its Main.

Setup on Tools & skills shows each operation and asks for confirmation before installing:

- Beads tools `br` and `bv`: Homebrew packages from `dicklesworthstone/tap`, or GitHub-hosted install scripts for `Dicklesworthstone/beads_rust` and `Dicklesworthstone/beads_viewer` when Homebrew is unavailable.
- Workflow skills: the third-party `skills` CLI fetched from npm downloads skills from `github.com/cuongntr/agent-skills` into Claude and Codex skills folders. That CLI has its own data-collection behavior.

The update screen checks npm for the latest package version and runs the Paseo plugin update command only after confirmation. Cleanup can remove the plugin’s role configuration and, when selected, its own saved data; it is separate from uninstalling the plugin.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-bm).*
