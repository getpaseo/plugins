Adds a **Hosts** page, workspace tab and status indicator to Paseo for monitoring CPU, memory, processes, disk usage and dev servers. Requires Paseo 0.9.0 or later; process management supports Linux and macOS. Readings use the container's memory limit when available.

You can select a runaway job, review the processes and children that would stop, and confirm the stop. Hosts sends SIGTERM and then SIGKILL to survivors after its grace period, checking process identity and logging actions. It excludes recognized Paseo components, agents, shells, databases and system services from ordinary process stops. Recognition relies on process names, paths and ownership and cannot identify every program.

The optional memory guard is off by default. When enabled, sustained critical memory pressure lets it stop the largest eligible job through the same checked stop path. It checks the setting and current pressure again before stopping and before escalation. An agent or dev server affected by stopping a build can lose its work in progress.

If a plugin stops answering, **Restart** asks for confirmation and runs `paseo plugin reload <id>`. If that command times out, Hosts identifies that plugin's daemon child from launch logs, checks its identity, sends SIGTERM and then SIGKILL if necessary, and retries the reload. Ambiguous process matches are refused; it does not restart the daemon or itself.

## Data access and disk reports

Background checks read system process and memory information and Paseo's `daemon.log`, every 10 seconds on Linux or 30 seconds on macOS. Workspace and process reports include paths and activity. Disk scans measure workspace folders, unlinked worktrees, temporary files and caches without following symlinks or crossing devices. They read Git ignore/tracking information and package-manager configuration to locate caches, and save scan results under the plugin's state directory.

In **Workspaces**, you can select eligible tool-managed folders such as `node_modules`, `.next` or Python caches, review the paths, sizes and regeneration costs, then confirm permanent deletion. Larger selections require an extra acknowledgment. Hosts checks the folder identity and ownership, Git tracking and ignore state, protected paths, running processes and open files again. `node_modules` needs a nearby package manifest and lockfile. Temporary workspace roots, shared caches, browser downloads, workspace roots and general output folders such as `dist`, `build` or coverage reports are left for **Ask an agent**.

Deletion moves the selected folder into a private quarantine beside it, inspects it, then removes it using the system's one-filesystem `rm`. A refused check attempts to put it back. An interrupted deletion can leave an incomplete folder or a hidden quarantine; Hosts reports that state and does not silently delete leftovers. Reinstall or rebuild to restore generated contents. These checks are snapshots, not a lock against other programs starting or changing files afterward. Files manually placed deep inside otherwise recognized tool-managed directories can be lost, so keep your own work outside those directories.

**Ask an agent** provides a reviewable request with paths, sizes and cleanup checks; the agent acts with its own permissions. Health and disk reports, plus selected terminal output, can be attached to conversations. Review the context before sending it to an agent. Process actions and connection/transfer records are stored locally.

## Dev-server connections

- **Browser links:** temporary public `trycloudflare.com` addresses protected by a session cookie. **Set up browser links** downloads the pinned official `cloudflared` release from GitHub, verifies its checksum and runs it. Linux and macOS x64/arm64 are supported; no download occurs until you request setup. Links expire and can be closed or extended.
- **Paired hosts:** two Paseo hosts running this plugin provide private localhost links through the Paseo relay (`wss://relay.paseo.sh` by default), with end-to-end encryption. Pairing grants no agent, file, process or daemon control and can be revoked.
- **SSH forwards:** saved presets use the host's `ssh` and its normal SSH configuration and credentials.

You can configure health URLs for the daemon to check on other machines. Git project transfers between paired hosts require separate sharing permission, a commit preview and an isolated checkout. Nothing syncs automatically. These features use network access for the connections you configure; monitoring data is not automatically sent to an agent.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/daemon-link).*
