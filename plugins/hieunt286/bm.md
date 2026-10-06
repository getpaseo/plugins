Adds Beads Management to Paseo: a Manager, Worker, Reviewer and optional Orchestrator agent team that works through your requests with the Beads issue tracker. It adds an Inbox for decisions and alerts, Projects with request timelines, and Settings. Requires Paseo 0.9.0 or later on macOS or Linux.

Opening the plugin creates four `bm-*` agent roles. Workers run without permission prompts by default (bypass mode on Claude, full access on Codex), so review changes before committing. A project can turn on **Hold risky actions**, which is off by default.

The agents get their tools through a local server that needs Paseo's **Allow agent tools** switch. That switch is machine-wide, applies to every agent, and you confirm it separately. The Orchestrator is optional and starts only when you start it. It reads every project that uses the plugin (secrets masked), sends that context to its model provider, and spends provider tokens.

Setup happens on the **Tools & skills** page, where each step shows what it will do and asks for confirmation before anything is installed:

- **Beads tools `br` and `bv`.** With Homebrew present, from the `dicklesworthstone/tap` tap. Without it, by running install scripts from `raw.githubusercontent.com` for `Dicklesworthstone/beads_rust` and `Dicklesworthstone/beads_viewer`.
- **Workflow skills.** Runs the third-party `skills` CLI, fetched from npm, which downloads the skills the roles need from `github.com/cuongntr/agent-skills` into the Claude and Codex skills folders.

Requests, traces and settings are stored on the daemon host.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-bm).*
