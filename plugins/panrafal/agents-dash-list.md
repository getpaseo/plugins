Adds an "Agents dash" sidebar entry that lists workspaces from every configured host in one feed, grouped by what needs your attention (waiting for you, unread, in progress, failing, approved, idle, merged or closed). Each row shows the workspace's agents and pull request state, and you can filter by host and project. It requires Paseo 0.7.2 or newer, and the multi-host feed needs Paseo 0.8 or newer. On older versions it shows only the host it was opened on.

You can archive workspaces from the dash, one at a time or with Archive all on the Unread and Approved groups. Archiving asks for confirmation when a workspace has uncommitted changes or unpushed commits, and Archive all always asks first. Idle rows can be marked unread. That mark is the plugin's own, so it is stored on the daemon the dash was opened on and does not sync across hosts. Host and project choices are stored the same way.

Pull request state is whatever the daemon has already synced from the forge. Project icons and label colors come from the host the dash was opened on, so workspaces from other hosts show a lettered square. The plugin reads label and icon data from the Paseo home and writes only its own settings and unread files there.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agents-dash-list).*
