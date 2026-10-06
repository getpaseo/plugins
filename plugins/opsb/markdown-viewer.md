Markdown Viewer adds a **Markdown** panel to every workspace for reading markdown files in tabs. A tab updates as its file changes on disk. You can open a file by path from the panel or a slash command.

**Follow mode** is on by default. When an agent writes or edits a markdown file through its edit tools, the file opens as a background tab, marked until you view it. A separate **Bring forward** setting, off by default, also raises the panel when that happens. The plugin ships a script agents can run to ask the panel to open a file.

## Access

A relative path is confined to the workspace directory. An absolute or `~/` path that you type is read from anywhere the daemon's user can read, but only markdown files are served. **Show in Finder** runs the platform's file opener on the file. Follow settings are saved locally in the Paseo home directory. The plugin makes no network requests.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-markdown-viewer).*
