Vitals adds a "Host vitals" page to the sidebar, and a Command Center entry, showing the CPU, memory and disk of the machine the Paseo daemon runs on, how much of it Paseo and each agent uses, and Docker container usage. The page refreshes every 5 seconds and has a refresh button.

## What the page shows

- Host: CPU model and core count, CPU use, load average, uptime, memory (used, available, cache, swap) and root filesystem usage.
- Paseo processes: memory and CPU for the daemon, for plugins and supporting services, and for each agent. Selecting an agent opens it.
- Containers: every container on the host, running or stopped, with state, CPU, memory, process count and network and block I/O.
- Largest host processes: the top eight by resident memory, by process name and pid.

## How agents are attributed

On Linux the plugin reads `/proc`. It finds the process named "Paseo Daemon", takes that process and its descendants, and reads each one's environment for `PASEO_AGENT_ID` to group processes by agent. Processes without an agent id count as daemon, plugin and service processes. If the daemon process cannot be identified, the page shows a warning and attributes nothing.

On other platforms, the plugin cannot read process data, so the Paseo, per-agent and largest-process sections are empty and the page warns that per-process and per-agent figures need Linux. Host CPU use, load average, uptime, memory totals, root filesystem usage and Docker are still collected the same way, but cache, anonymous memory and swap are shown as zero.

## Docker

If the `docker` command is available to the daemon's user, the plugin runs `docker stats --no-stream --all` and `docker ps --all` (4-second timeout). If Docker is missing, slow or denied, the Containers section says so and the rest of the page still works. Containers are all those on the host, not only ones started by Paseo agents.

## Reads and sends

The plugin runs on the daemon host and lists agents through Paseo to show titles and providers. It reads process data, `/proc/meminfo`, and filesystem statistics, runs only the two Docker commands above, writes nothing, and makes no network requests. The page displays the host name and the process names on the machine, so anyone who can open it sees them.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/vitals).*
