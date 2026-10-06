Vitals adds a Host vitals page to the sidebar showing the CPU, memory and disk of the machine the Paseo daemon runs on, how much of it Paseo and each agent are using, and Docker container usage.

Per-process and per-agent figures need a Linux host. The plugin reads `/proc`, including each Paseo process's environment to find its `PASEO_AGENT_ID`, so it can attribute usage to agents. On other platforms those sections are empty and the page says so, while host totals still work.

Docker figures are optional. If the `docker` command is available to the daemon's user, the plugin runs `docker stats` and `docker ps` and lists every container on the host, not only those Paseo started. Without Docker access the containers section reports it and the rest of the page is unaffected.

Anyone who can open the page sees the host name and the names of the largest processes on the machine. The plugin writes nothing and makes no network requests.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/vitals).*
