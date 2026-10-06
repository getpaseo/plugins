DeepSeek Harness adds a provider to Paseo so you can start agents that run through the DeepSeek Harness command line tool (`dsh`) on the daemon machine. Paseo shows the conversation in its normal agent view, and the plugin has no screens of its own.

DeepSeek Harness must already be installed, logged in and configured on the daemon machine, with `dsh` on the daemon's `PATH`. The plugin refuses to start a session if `dsh --version` reports anything below 0.1.5-rc.1 or cannot be read. It also needs Paseo 0.8.0 or newer and Node.js 22.19.0 or newer on the daemon. The plugin does not install or configure `dsh` and does not read its credential files. The model and reasoning-effort choices come from the models `dsh` reports, so they follow your DeepSeek Harness setup.

Each agent session runs `dsh` as a child process under your operating system user, with the daemon's environment plus the session's environment variables. Any credentials in that environment reach `dsh`, and the plugin adds no sandbox or permission policy of its own. `dsh` itself makes the calls to DeepSeek's service.

Resuming a session asks `dsh` to restore its own context. If that fails, the plugin reports the error and does not start a new session. Provider slash commands are refused.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/deepseek-harness).*
