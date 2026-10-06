Parent Wake notifies an agent that spawned child agents each time a child asks for permission or finishes a turn, for as long as the parent is not archived. Canceled turns are not reported.

A permission notification includes the child's question and the request so the parent can answer it. A finished-turn notification includes the child's last assistant message, limited to 4000 characters, or the error if the turn failed. Notifications are sent without interrupting a turn the parent is running.

Notifications are on by default and need no setup. To opt out, set the label `subagent-notifications` to `off`, `false`, `0` or an empty value on the parent, which silences all of its children, or on a single child. Passing `notifyOnFinish: false` when creating or prompting a child avoids receiving the first notification twice.

If the parent has a permission request of its own pending, notifications are held and delivered once it is resolved or the parent's turn ends. Held notifications are kept in memory and are lost if the plugin restarts, and events that occur while the daemon or plugin is restarting are not replayed.

The manifest requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/parent-wake).*
