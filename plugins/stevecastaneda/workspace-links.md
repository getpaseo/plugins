Workspace Links shows the URLs from a `workspace-links.json` file in your workspace root behind one Links control. Choose a link to open it. The control is a composer pill by default, and a setting moves it to a workspace header button. The placement applies to all workspaces on the connected host. It needs Paseo 0.9 or later.

The file is a JSON array of entries with a `label` and a `url`, up to 100, and only HTTP(S) URLs are accepted. You can write it by hand or have your own setup script generate it.

Links open on the device you are viewing Paseo from, so `localhost` means that device. If the daemon runs elsewhere, a `localhost` link reaches the daemon's dev server only when the port is forwarded to your device.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/workspace-links).*
