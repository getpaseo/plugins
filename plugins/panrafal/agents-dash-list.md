Adds a sidebar dashboard that gathers workspaces from every configured host into one list ordered by what needs your attention, with each workspace's agents and pull request state. It requires Paseo 0.7.2 or newer, and showing several hosts needs Paseo 0.8 or newer. Older versions show only the host the dashboard was opened on.

You can archive workspaces from the dashboard one at a time or in bulk. Archiving a single workspace asks for confirmation only when it has uncommitted changes or unpushed commits, and bulk archive always asks first. The unread marks and host and project choices are the plugin's own, stored on the host the dashboard was opened on, so they do not sync across hosts.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agents-dash-list).*
