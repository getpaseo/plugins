LiteLLM TTL adds a pill to the composer of each Claude agent showing how much prompt-cache time is left on that agent's route through LiteLLM. The label is just the remaining time, such as `36m` or `2h 10m`, and it counts down between refreshes. The pill's icon color gives the cache state: green when a cache is held, yellow when 5 minutes or less remain, red when there is no cache, and lilac for a local route. Tapping the pill shows the Claude account serving the route, or the plan name for other routes, and the time left.

On desktop the pill is always visible. On narrow layouts such as a phone it appears only when the cache is about to expire, so it does not crowd the pill row.

Setup:

- It reads from a routing panel (control-nexus) that must already exist on your network and serve `GET /api/session-routing/session/<session id>` without a login. This is the author's own infrastructure, so the plugin is only useful if you run a compatible panel.
- Point the plugin at it by setting `PASEO_TTL_PANEL` to the panel's base URL on the host running the Paseo daemon, or by putting the URL on the first line of `~/.config/paseo-ttl/panel`. Without a URL the pill shows a dash and the popover says there is no data.

What it reads and sends:

- Every 30 seconds, the daemon sends a plain HTTP `GET` with each Claude agent's session id to the panel URL you set (cached for 15 seconds per session). Nothing else is sent, no credentials are attached, and no other host is contacted.
- The only local file it reads is the panel URL file above. It writes nothing.
- The popover text is in Spanish.
