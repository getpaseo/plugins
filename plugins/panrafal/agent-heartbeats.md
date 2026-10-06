Adds a heartbeat pill to each active agent's composer showing how many heartbeats are scheduled for it. Pressing the pill opens a panel to list, add, edit, and delete that agent's heartbeats, including ones created outside the plugin. It requires Paseo 0.7.2 or newer.

The schedule field accepts five-field cron, one-shot delays such as `15m` or `in one hour`, and recurring phrases such as `every 15 minutes` when cron can express them exactly. Editing only the cron expression keeps a heartbeat's run history. Changing the prompt or maximum run count creates a replacement heartbeat and resets the run count, because Paseo does not expose those updates.

The plugin reads the daemon's schedule records from the Paseo home directory and makes changes by running `paseo heartbeat create`, `update`, and `delete` on the daemon host, after checking that the heartbeat belongs to the selected agent.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agent-heartbeats).*
