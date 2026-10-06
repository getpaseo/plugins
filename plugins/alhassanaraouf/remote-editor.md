Remote Editor adds an "Open in editor" action to Paseo that opens a workspace folder in VS Code, Cursor or Zed, over SSH when the Paseo daemon runs on another machine, or as a local folder when it runs on yours. The action and its buttons are hidden on iOS and Android and appear on desktop and web clients. It requires Paseo 0.8.0 or later.

## What it does

It builds an editor deep link and hands it to your operating system, which launches the editor. For the folder it uses the agent's working directory (composer pill) or the workspace directory (header button and Command Center). Path segments are percent-encoded.

| Editor | Remote link | Local link |
| --- | --- | --- |
| VS Code | `vscode://vscode-remote/ssh-remote+<user>@<host>/<path>` | `vscode://file/<path>` |
| Cursor | `cursor://vscode-remote/ssh-remote+<user>@<host>/<path>` | `cursor://file/<path>` |
| Zed | `zed://ssh/<user>@<host>[:<port>]/<path>` (the port is omitted when it is 22) | `zed://file://<path>` |

Where it appears depends on the **Show button in** setting:

- **Composer** (default): an "Editor" pill on each agent's composer, with a picker.
- **Workspace header**: an "Open in editor" button that opens the default editor directly.
- **Both**.

Command Center also gets "Open in default editor" and one "Open in <editor>" item per editor.

## Setup

The editor must already be able to connect to the daemon host. For remote links that means the editor's remote or SSH support is installed and `ssh <user>@<host>` works from your machine. If the daemon's hostname does not resolve from your machine, set the SSH host in the settings.

## Settings

Settings → Remote Editor, stored per host:

- **Open in**: the default editor (VS Code, Cursor, Zed or a custom editor).
- **SSH host** and **SSH user**: blank uses the hostname and username the daemon reports. Set them for a hostname that does not resolve locally, such as a LAN or VPN name or an `~/.ssh/config` alias.
- **SSH port**: default 22, used in Zed and custom links. VS Code and Cursor links carry no port, so use an `~/.ssh/config` alias as the SSH host for a non-standard port.
- **Open local paths directly**: off by default. Turn it on when the daemon runs on the same machine as the app, so the editor opens the folder without SSH.
- **Custom editors**: a label, a link template using `{user}`, `{host}`, `{port}` and `{path}`, and an optional template for local mode. Only `{path}` is encoded.

## What it reads and sends

The server side of the plugin reports the daemon's hostname and username to the app, and stores the settings above. The built-in links use the editors' app schemes, and your SSH host, user and the folder path appear in the link that your operating system passes to the editor. Custom link templates are not restricted, so a template that starts with `http://` or `https://` navigates the client to that address with the substituted user, host, port and path, which sends them to whoever runs it. Use only templates you trust. If opening the link fails, or the settings cannot be read, the plugin opens its settings screen.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/remote-editor).*
