Prompt Manager keeps a library of Markdown prompts on the machine that runs the Paseo daemon. A **Prompts** item in the sidebar opens the library, where you create, edit, preview, search, archive, and restore prompts. Each prompt is a `.md` file, and the first Markdown heading is its title. Folders are directories inside the library. Descriptions and tags are stored in the file's frontmatter, and search covers title, filename, content, description, and tags.

Each save writes a full snapshot under `versions/` in the library. A history panel shows a snapshot as source or preview and restores it as a new version. If a file was edited outside the plugin, saving a stale draft is rejected, and the externally edited content is preserved before it is replaced or archived.

The plugin requires Paseo 0.11.0-beta.3 or later on the daemon and on each app that shows it.

## Sending prompts to an agent

Prompts reach an agent only when you choose to send them:

- The **Prompts** pill in the agent composer searches the library and sends the chosen prompt to that agent.
- **Saved prompt** in the composer attachment menu attaches a snapshot of a prompt to your message.
- `/prompts` opens the prompt panel, and `/prompt <name>` sends that prompt to the current agent and starts a turn.
- **Send to agent** in the prompt panel sends the selected prompt.

The agent receives the prompt body, not the frontmatter.

## Importing files

**Prompts → Import** copies `.md` files into the library and creates their first versions. Only the files or folders you select are read. In a browser client you pick files or a folder from your device. On any client you can enter absolute or `~/` paths to files or folders on the Paseo host. Source files stay in place, and prompts whose paths already exist (including archived ones) are skipped and reported. Hidden entries, symbolic links, and `versions` folders are excluded.

Limits per import:

- 100 Markdown files
- 8 MB total
- 512 KB per file
- 5,000 directory entries when scanning host folders

Prompts saved in the editor are also limited to 512 KB.

## Settings and storage

The library is at `~/.config/paseo/prompt-lib/` by default, and preferences are in `~/.config/paseo/prompt-manager.json`. If `XDG_CONFIG_HOME` is set, it replaces `~/.config` for both. **Prompts → Settings** accepts an absolute or `~/` path for a different library directory. Changing it opens another library and does not move files. The library belongs to the daemon host and is shared by its clients and agents.

## Git sync

Git sync is off by default. It runs only after you turn it on in settings, initialize the library as a repository, and choose **Sync now**. It needs Git on the daemon host, and you configure your own Git author and remote credentials there. The plugin uses your existing Git authentication.

Initializing runs `git init` in the library directory unless it is already a repository, with an optional origin URL (HTTPS, SSH, `git@host:path`, or an absolute local path). Without an origin, sync makes local commits only. With one, **Sync now** commits the prompt files and version history, fetches the origin branch, fast-forwards, and pushes, so your prompts and their history are sent to that remote. Git hooks are disabled for these commands, and no fetched code is run. Sync stops, leaving local commits intact, if the branch has diverged, the origin has other branches but not the current one, or unrelated files are staged. An empty origin is accepted and receives the push. The library directory must be the repository root, and each Git command has a 30-second timeout.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-prompt-manager).*
