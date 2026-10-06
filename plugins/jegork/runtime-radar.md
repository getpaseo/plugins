Runtime Radar lists the listening TCP ports and Docker containers on the daemon machine and ties them to the workspaces and projects whose directories they run in. It can also stop processes and containers, so it is a control surface as well as a monitor. The author's repository marks this version as archived, with development moved to a different repository.

## Setup

`lsof` must be installed on the daemon machine. `docker` is optional, and the panel says when it is missing.

## Control and access

- **Process actions:** Stop sends SIGTERM and Force kill sends SIGKILL to a listening process. **Container actions:** Stop and Restart run `docker stop` and `docker restart`. Each action asks for confirmation first.
- These actions apply to any listening process or container on the host that the daemon's user can affect, and not only to ones started from Paseo workspaces. The daemon refuses Paseo's own processes.
- The **Allow actions** setting (on by default) hides the action buttons in the app. The daemon does not check it, so it is not a security boundary.
- The plugin reads by running `lsof` and `docker ps` and by listing your Paseo workspaces and projects. It makes no network requests and downloads or installs nothing.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/runtime-radar).*
