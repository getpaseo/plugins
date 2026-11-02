Keep Awake prevents the computer running your Paseo daemon from sleeping while agent turns are running. It starts the system inhibitor on the first observed turn start and releases it after every observed active agent has finished, or when the plugin is disabled. It requires Paseo 0.8.0 or later and has no settings or interface.

It uses `caffeinate -dimsu` on macOS, `systemd-inhibit` with `sleep infinity` on Linux, and PowerShell calling Windows `SetThreadExecutionState` on Windows. The macOS and Windows commands also keep the display awake. These tools must already be available on the daemon host; the plugin does not download or install software. Linux requires a working systemd inhibition service and permission to use it. A remote host stays awake independently of the device you use to connect to Paseo.

The plugin observes agent turn-start and turn-end events and keeps active agent IDs in memory. It does not read conversations, files or credentials, and makes no network requests. Its subprocesses use fixed commands and arguments.

Turns already running when the plugin loads are not detected until a later turn-start event. If the inhibitor command fails or exits, the plugin does not retry while the observed active-agent set remains nonempty. Sleep prevention depends on the host’s OS policies and the required system tool being available.
