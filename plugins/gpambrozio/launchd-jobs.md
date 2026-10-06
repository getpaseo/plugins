Launchd Jobs schedules shell commands on a Mac through launchd. It adds a **Scheduled jobs** sidebar surface where you create a job from a name, a command, an optional working directory, and either a cron expression or a fixed interval. The plugin writes the job as a LaunchAgent, and launchd runs it whether or not Paseo is open.

The surface shows each job's launchd state, its last twenty runs with duration and exit code, and the tail of its log. **Run now** starts a job immediately without changing its schedule, and **Follow** streams the log as it is written. The sidebar row shows a failing count, such as **Scheduled jobs (2 failing)**, based on each job's most recent run, checked about once a minute. Opening a job clears it from the count until it fails again.

## Requirements

- Paseo 0.9.0 or newer.
- The daemon must run on macOS inside your login session. On Linux the plugin loads and the surface says it is unsupported. The Paseo app can be on any device.

## How jobs behave

- Each job is a plist named `com.paseo-plugins.launchd-jobs.<name>.plist` in `~/Library/LaunchAgents`. The plugin only lists, writes and removes files with that prefix.
- Commands run through `/bin/zsh -lc` with the `PATH` your interactive shell reports. That `PATH` is captured when the job is saved, so save the job again after changing it.
- Cron expressions use five fields. launchd has no expression language, so each combination of listed values becomes its own entry, up to a limit of 1,000. When both day of month and weekday are given, launchd requires both to match, unlike cron. Six-field expressions are refused.
- If the Mac is asleep at the scheduled time, the job runs once on wake. If it is off or you are logged out, the run is missed.
- Logs are kept under the daemon's plugin data directory, located from `PASEO_HOME`. A log rotates past 1 MB and history keeps the last 200 runs.
- **Follow** borrows an open workspace and shows a terminal named `launchd: <job name>` in it while active.

## Removing jobs

Deleting a job in the surface unloads it and deletes its plist, log and history. Removing the plugin does not remove jobs, because they belong to launchd. Delete the jobs first.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/launchd-jobs).*
