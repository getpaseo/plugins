Setup Monitor shows the live progress of a worktree's `worktree.setup` script in Paseo, so a long dependency install is no longer silent. It needs Paseo 0.9 or later.

While setup runs, a workspace header button shows a spinner and elapsed time, including before the workspace has an agent. Click it to open a popover with each command's status, duration and log. Failures remain visible, and a completed setup that this session watched stays visible until you dismiss it.

The plugin reads setup status from the Paseo daemon; it does not run the commands itself or send logs to an external service. Logs shown in the popover include any sensitive text your setup script prints. Status refreshes every two seconds, and long logs are trimmed to their last 8,000 characters.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/setup-monitor).*
