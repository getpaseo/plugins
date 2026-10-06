Command Deck saves PowerShell commands for a Project and runs each one in a terminal in the current Workspace. You start, interrupt, and terminate runs from a Commands panel, from a Commands button on the agent composer, or from Command Center ("Open workspace commands", which needs no agent).

It works on Windows daemon hosts only, and the manifest requires Paseo 0.8.0 or newer within the 0.8 series (`^0.8.0`). The daemon needs PowerShell 7 (`pwsh.exe`), found in `Program Files\PowerShell\7` or on the daemon's `PATH`, plus whatever tools your commands call (for example Node.js).

## Setup

Open Settings, then Command Deck, pick a Project, and choose Add command. Each command has:

- **Name**: one line, up to 80 characters.
- **PowerShell command**: one line, up to 8,000 characters.
- **Working directory** (optional): empty means the Workspace root. Relative paths resolve against that root, and full Windows absolute paths are accepted. Drive-relative paths such as `C:foo`, root-relative paths such as `\foo`, and directories that do not exist are rejected.

Apply to draft, then choose Save changes. Edits you do not save are lost when you leave Settings. If the settings changed from another client, your draft is kept and you can copy it before loading the latest version. The library holds at most 100 commands.

Commands belong to a Project and are shared by all of its Workspaces and worktrees. They are saved on the host, as plain settings and not in a secret store, so keep credentials out of command lines.

## Running commands

Select a command in the panel and press Run command. Each run opens a terminal named `[command-deck:…] <name>`, started as `pwsh.exe -NoLogo -NoProfile -Command <your command>`. The command runs with the daemon's environment and privileges, not those of the device you are viewing from, and PowerShell profiles are not loaded.

- The panel polls the terminal every two seconds and shows the last 200 lines of output, with long lines truncated. Output is not stored as a log. A command that finishes quickly can exit before any output is captured.
- A terminal that is still open does not mean the command succeeded or that a server is ready. After the terminal ends, the panel reports the result as unknown.
- **Send Ctrl+C** requests an interrupt, and the process may keep running. **Terminate terminal** closes the terminal after you confirm.
- There is one run per command per Workspace. If one terminal already exists for the command, Run reuses it instead of starting another.
- Run requests are never retried. If a response is lost, the run shows "could not be confirmed". Check the Workspace terminals first. Allow another run clears that record, does not stop any process, and can start a duplicate.
- Reloading or removing the plugin does not kill terminals. After a reconnect, the panel finds its terminals again by their names, so do not rename them. If more than one terminal matches a command, the plugin does not control any of them until you resolve it in the terminal list.
- Deleting a command does not close its terminal, which stays in the panel as "(removed command)". Changing a command affects only its next run.
- The panel has no input field, so answer interactive prompts in the Workspace terminal. A development server started on the host is not reachable from your phone through `localhost`.

## What it reads and sends

The plugin lists and creates terminals in the Workspace and reads their output, and it lists Projects and Workspaces for the Project picker. It reads agents to add the Commands button to the composer. The source contains no network calls of its own. Everything stays between the app and the daemon.

Settings from an older version keyed by Workspace are kept and listed under "Needs Project assignment" until you assign each command to a Project.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/command-deck).*
