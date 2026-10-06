Grafana adds a sidebar view of your Grafana alerts and lets you start an agent to investigate one. It works through the `gcx` command line tool, using whichever `gcx` context is current on the daemon machine. The author's repository marks this version as archived and says development moved to a different repository.

The **Grafana** sidebar item lists firing and pending alert instances, with a toggle to show every instance. Each row links to its rule and dashboard in Grafana and refreshes every minute. **Investigate** asks you to pick a workspace, then starts an agent there with the rule's state, labels, annotations, runbook link and query, and an instruction to use the `investigate-alert` and `debug-with-grafana` skills through `gcx`. The same investigation starts in the current workspace from `/grafana-investigate <rule name or uid>`. A Command Center item opens the alerts view.

The composer also gains two attachment sources, **Grafana dashboard** and **Grafana alert rule**. Attaching one adds text to your message: a dashboard's title, folder, tags, link, description and panel titles, or a rule's state, labels, annotations and query. Searches return up to 10 dashboards and 25 rules.

## Setup

Install `gcx` on the daemon machine and run `gcx login`. The plugin also looks in `/opt/homebrew/bin`, `/usr/local/bin` and `~/.local/bin` when `gcx` is not on the daemon's `PATH`. If `gcx` is missing or signed out, the plugin shows an error asking you to run `gcx login`.

## Data and limits

- The plugin runs `gcx` itself with read-only commands (listing contexts, alert instances, alert rules and dashboards, searching and fetching dashboards), up to three at a time. It clears the agent environment variables that switch `gcx` into agent mode so the output stays plain JSON. It has no network access of its own, and `gcx` contacts the Grafana server in the current context.
- Investigation agents always use the `claude/claude-sonnet-5` provider and model, a constant in the plugin source, so a Claude provider must be available.
- The alert details sent to an investigation agent or attached to a message go to that agent's model provider.
- The investigation prompt tells the agent not to change alert rules or dashboards. The agent runs under your normal Paseo permissions and can call `gcx` itself, so that instruction is not an enforced limit.
- Requires Paseo 0.8.0-beta.1 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-grafana).*
