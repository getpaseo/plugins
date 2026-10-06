Finder Links makes local file links in assistant messages reveal the file in your system file manager. Clicking a link to a file selects it in Finder on macOS or File Explorer on Windows. For a directory, macOS reveals it in Finder and Windows opens it in File Explorer. Relative paths resolve against the active agent's or workspace's directory, and `~/` resolves against the daemon user's home directory.

It works in Paseo's web-based clients, including the desktop app, and not in native mobile clients. Linux is not supported. Source references such as `src/app.ts:42` and web links keep Paseo's built-in behavior.

The file manager opens on the machine where the daemon runs, not on the device you click from. The plugin reads file metadata to confirm the path exists and does not read file contents. It requires Paseo 0.9.2 or later and has no settings.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-finder-links).*
