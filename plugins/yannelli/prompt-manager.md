Prompt Manager keeps a library of Markdown prompts on the machine that runs the Paseo daemon, with search, folders, tags, and a **Prompts** item in the sidebar. It requires Paseo 0.11.0-beta.3 or later on the daemon and on each app that shows it.

Each save keeps a full snapshot of the prompt, and you can view a snapshot and restore it as a new version. If a file was edited outside the plugin, saving a stale draft is rejected instead of overwriting it.

A prompt is sent to an agent only when you choose it, from the composer, an attachment, or a slash command. The agent receives the prompt body.

You can import Markdown files or folders you select, either from your device in a browser or by path on the daemon host. Imports copy the files into the library, skip prompts that already exist, and leave the originals in place. Imports have size and count limits.

The library is at `~/.config/paseo/prompt-lib/` by default, or under `XDG_CONFIG_HOME` if that is set. **Prompts → Settings** lets you pick another library directory, which opens that directory and does not move existing files. The library is shared by all clients and agents of that daemon.

Git sync is off by default. It runs only after you enable it, initialize the library as a repository, and choose **Sync now**. It needs Git on the daemon host and uses your existing Git author and remote authentication. With an origin set, sync sends your prompt files and version history to that remote and pushes to it. Without one, it makes local commits only. Git hooks are disabled, and no fetched code is run. If the remote branch has diverged, sync stops with local commits intact and you resolve it with Git.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-prompt-manager).*
