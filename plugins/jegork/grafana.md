Grafana shows your Grafana alerts in Paseo and lets you start an agent to investigate one. It also adds Grafana dashboards and alert rules as composer attachments. The author's repository marks this version as archived, with development moved to a different repository.

## Setup

The daemon machine needs the `gcx` command line tool, signed in with `gcx login`. The plugin uses whichever `gcx` context is current, and shows an error asking you to log in when `gcx` is missing or signed out. Investigation agents always use the `claude/claude-sonnet-5` model, fixed in the plugin source, so a Claude provider must be available.

## Access and authority

The plugin itself only reads: it runs `gcx` to list alerts, rules and dashboards, and `gcx` contacts the Grafana server in the current context. It has no network access of its own.

An investigation or an attachment puts alert or dashboard details into a message, such as labels, annotations, queries and descriptions, and that message goes to the agent's model provider.

The investigation agent is an ordinary Paseo agent with your permissions, and it can run `gcx` itself, including commands that change Grafana. The prompt asks it not to change alert rules or dashboards, but nothing enforces that.

Requires Paseo 0.8.0-beta.1 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-grafana).*
