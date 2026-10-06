Launchd Jobs schedules shell commands on a Mac through launchd. You create a job from a name, a command, an optional working directory, and a cron expression or fixed interval, and the plugin installs it as a LaunchAgent. launchd runs it whether or not Paseo is open. The **Scheduled jobs** sidebar surface shows each job's status, recent runs with exit codes, and its log, and can run a job immediately. The sidebar row shows how many jobs are failing.

Requirements:

- Paseo 0.9.0 or newer.
- The daemon must run on macOS in your login session. On Linux the plugin loads but reports it is unsupported. The Paseo app can be on any device.

Behavior to know:

- Commands run through `/bin/zsh -lc` with the `PATH` your interactive shell reports, captured when the job is saved. Save the job again after changing your `PATH`.
- Cron expressions use five fields, and launchd's matching differs from cron. When both day of month and weekday are given, launchd requires both to match, not either. Six-field expressions are refused.
- If the Mac is asleep at the scheduled time, the job runs once on wake. If the Mac is off or you are logged out, the run is missed.
- Jobs are files in `~/Library/LaunchAgents` with the prefix `com.paseo-plugins.launchd-jobs.`. The plugin touches only files with that prefix.
- Removing the plugin does not remove jobs, because they belong to launchd and keep running. Delete the jobs in the surface first, which also deletes their logs and history.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/launchd-jobs).*
