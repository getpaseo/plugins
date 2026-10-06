Setup Monitor shows the live progress of a worktree's `worktree.setup` script in Paseo, so a long dependency install is no longer silent. It needs Paseo 0.9 or later.

When setup starts it opens a Setup panel in Explorer with each command's status and log, and it marks the result as finished or failed. It only displays the setup status the Paseo daemon already tracks, and it does not run your setup commands itself.

Setup logs are visible in the panel, including any sensitive text your setup script prints.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/setup-monitor).*
