Vitals adds a Host vitals page to the sidebar showing the CPU, memory and disk of the machine the Paseo daemon runs on, how much of it Paseo and each agent are using, and Docker container usage.

Per-process and per-agent figures need a Linux host. The plugin reads `/proc`, including each Paseo process's environment to find its `PASEO_AGENT_ID`, so it can attribute usage to agents. On other platforms those sections are empty and the page says so, while host totals still work.

Docker figures are optional. If the `docker` command is available to the daemon's user, the plugin runs `docker stats` and `docker ps` and lists every container on the host, not only those Paseo started. Without Docker access the containers section reports it and the rest of the page is unaffected.

Anyone who can open the page sees the host name and the names of the largest processes on the machine. The collector reads metrics without changing processes or containers. Display preferences are saved through Paseo plugin settings.

Requires Paseo 0.14.0 or newer. Interactive Claude and Codex sessions can request the same host snapshot through an agent tool, including host identity, agent titles and Docker container names and health. These results reach the calling agent and its model provider; process environments and command lines are excluded from the response. The session label `plugin-tools/enabled: "false"` disables the tool. Agent enumeration follows all pages rather than stopping at 200 sessions. Command-K opens the dashboard and display settings even when the sidebar is hidden.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/vitals).*
