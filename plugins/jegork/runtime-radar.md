Runtime Radar lists the listening TCP ports and Docker containers on the daemon machine, grouped by the workspace or project whose directory they belong to. It can also stop or kill processes and stop or restart containers from the list, so it is a control surface and not only a monitor. The author's repository marks this version as archived and says development moved to a different repository.

The **Runtime radar** sidebar item shows every open workspace with its ports and containers, then projects with processes but no open workspace, then anything unattributed. A **Runtime** panel in a workspace or the Explorer shows that workspace's entries first and everything else on the machine below with its working directory. Both refresh every five seconds while open. You can group by workspace, project (worktrees folded into their project) or kind (all ports, then all containers), and the choice is saved per host. Open them from the Command Center with **Open runtime panel** or **Open runtime radar**.

## Setup

`lsof` must be installed on the daemon machine. `docker` is optional, and the panel says when it is missing.

## What it does on the machine

- **Reads:** the daemon runs `lsof` to list TCP listeners and each process's working directory, and `docker ps` to list running containers. A process belongs to the workspace whose directory contains its working directory, deepest match first. A container belongs to the workspace matching its Docker Compose working directory label, and plain `docker run` containers appear as unattributed. The plugin also lists your Paseo workspaces and projects.
- **Process actions:** **Stop** sends SIGTERM and **Force kill** sends SIGKILL to a listening process, after a confirmation dialog. The daemon first checks with `lsof` that the process is still listening, and refuses processes named Paseo, the plugin's own process and its parent. Signals run as the daemon's user, so processes of other users fail with a permission error.
- **Container actions:** **Stop** and **Restart** run `docker stop` and `docker restart` on the container, after a confirmation dialog.
- The **Allow actions** setting (on by default) removes these buttons from the panel. The daemon handlers do not check the setting themselves.
- The plugin makes no network requests, downloads nothing and installs nothing.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/runtime-radar).*
