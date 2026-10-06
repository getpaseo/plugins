Markdown Viewer adds a **Markdown** panel to every workspace for reading markdown files in tabs. A tab refreshes when its file changes on disk, and the panel can open files that agents write.

Open it from the workspace panel list, from the Command Center (**Open markdown viewer**), or with `/md <path>` in the composer, which opens the tab without sending a prompt to the agent. The viewer renders headings, lists, task boxes, tables, code blocks, quotes, links, Obsidian wikilinks and YAML frontmatter in every Paseo theme, on desktop, web and phones.

## Follow mode

Two host-wide settings control it. **Follow agents** (on by default) opens a background tab, marked with a green dot until you view it, when an agent finishes a structured write or edit of a markdown file. **Bring forward** (off by default) also raises the panel. Files written through a shell heredoc are not detected. Agents can show a file explicitly with the plugin's `bin/open-markdown <path>` script, which writes a small request file into an inbox folder under the Paseo home directory. The daemon turns it into a row in that agent's conversation, and the row opens the tab. No network port is opened.

## What it reads and runs

- Only `.md`, `.markdown` and `.mdx` files up to 2 MB are served. A relative path is confined to the workspace directory, including through symlinks. An absolute path or `~/` path you type is read as typed, from anywhere the daemon user can read.
- The daemon watches each open file's folder for changes and re-checks it about every 1.5 seconds, and the panel waits on a long poll until the content differs.
- **Show in Finder** runs the platform's file opener (`open -R` on macOS, `explorer.exe` on Windows, `xdg-open` on the containing folder elsewhere) on a file the viewer could display.
- Follow mode subscribes to every live agent's timeline on the daemon. The plugin reads its own saved settings file under the Paseo home directory and creates and drains the inbox folder `~/.paseo/plugin-data/paseo-markdown-viewer/inbox`. It makes no outbound network requests.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-markdown-viewer).*
