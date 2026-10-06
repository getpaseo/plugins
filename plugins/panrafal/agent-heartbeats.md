Shows each agent's scheduled heartbeats in a pill on its composer and lets you add, edit, and delete them from a panel, including heartbeats created elsewhere. It requires Paseo 0.7.2 or newer.

Changing only a heartbeat's schedule keeps its run history. Changing its prompt or maximum run count creates a replacement heartbeat and resets the history, because Paseo does not expose those updates. The plugin reads the daemon's schedule records and makes changes by running the `paseo heartbeat` command on the daemon host, after checking the heartbeat belongs to the selected agent.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agent-heartbeats).*
