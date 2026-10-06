Remote Editor adds an **Editor** pill to the composer of every active agent on the daemon where it is installed. Pressing it opens the agent's working directory (the project folder or its worktree) in your editor over the Paseo host name.

On desktop it opens a link like `vscode://vscode-remote/ssh-remote+<host><directory>`. **Settings, Plugins, vscode-open-remote, Remote editor** (also **Configure remote editor** in the Command Center) chooses VS Code (the default), Cursor (`cursor://`) or a custom URI prefix of your own, which must look like `scheme://...`. The choice is saved on the daemon and shared by its clients.

## Setup and limits

- The pill is daemon-scoped: it appears on agents of each Paseo host where the plugin is active, so a remote host with the plugin gets pills for its own agents. Paseo cannot tell a plugin whether it runs on the local machine, so a local host with the plugin also gets pills.
- Desktop use needs VS Code Remote - SSH or Cursor Remote SSH, and the Paseo host name must resolve in the desktop machine's SSH config.
- The pill is hidden on phones, meaning mobile devices with a shortest screen side under 600 logical pixels.
- On tablets the pill opens `https://vscode.dev/tunnel/<host><directory>`. That needs a VS Code Remote Tunnel already running on the daemon machine, with a tunnel name that matches the host name in Paseo.
- Paseo's own opener accepts only HTTP(S), so for editor links the plugin briefly opens a protocol window, which it closes after handing the URL to the editor.

## Data

The plugin reads each agent's directory and the host name from Paseo, and builds the link in the app. It makes no network requests of its own, and the link opens only when you press the pill. The only file it writes is its settings, at `$PASEO_HOME/plugin-data/vscode-open-remote/settings.json` with owner-only permissions.

Requires Paseo 0.7.2 or later and a client that supports plugin settings screens.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/vscode-open-remote).*
