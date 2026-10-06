Terminal integration connects agent chats and Paseo terminals in both directions. It requires Paseo 0.10.1 or later.

## What it does

**Agent to terminal.** Fenced code blocks in an agent's reply get run controls when the language is `bash`, `sh`, `shell`, `console`, `zsh`, `fish`, `python` or `js`/`node`. Nothing runs until you press a control or submit `/run`.

- **Run** types the block into a terminal tab named "Agent commands" in the agent's workspace, creating the tab if it does not exist.
- **Run in background** runs the block as a hidden process in the agent's working directory, with no terminal tab and no stdin, so a prompt for a password or confirmation fails instead of waiting. Only the last 5,000 lines are kept.
- **Stop** sends Ctrl-C. **Send output so far** reports a command that is still running.
- With **Send output to agent** checked (the default), the command, exit code and output go to the agent as a new message when the block finishes. If the agent is busy, the message waits until its turn ends.

Each block runs as its own script in the agent's working directory, so `cd` and `export` do not carry over to the next run. Terminal runs in one workspace are queued one at a time, and a command that has not started within 20 seconds fails. After 6 hours the plugin stops watching a terminal run and marks it failed, but the command keeps running in the terminal until you stop it. A background run is killed (`SIGKILL`) after 6 hours. The agent receives at most 300 lines or 24,000 characters of output.

**Terminal to agent.** In the composer's attachment menu, **Terminal output** lists terminals on the daemon, across all workspaces, and attaches the latest lines of the one you pick. Type part of a terminal name, path or workspace name to filter, and a number for the line count (`build 500`, default 200, maximum 2,000).

Commands:

| Command | Effect |
| --- | --- |
| `/run <command>` | Runs a shell command and sends its output to the agent |
| `/blocks` | Adds run controls for the latest reply, for example in an older chat |

On Paseo versions with inline code block actions the controls appear under each block. On other versions a "Run in terminal" card appears under the reply.

## Setup

Plugins must be enabled under Settings → Plugins. The daemon host needs macOS or Linux with `bash`, plus `python3` or `node` to run those blocks. To open "Agent commands" beside the chat, set Settings → Layout → Open location → Opening a terminal → On the side, where your Paseo version has that setting.

## Settings

Settings → Plugins → Terminal integration, stored per host:

- **Send output to agent**: the default state of the checkbox on each block.
- **Inject command instructions**: off by default. When on, newly created agents get command guidance added to their system prompt, either **Local daemon** (commands already run on the daemon host, so no SSH is needed to reach it) or **Client–server** (commands for another machine need an explicit transport such as SSH, to a destination you supply). Both texts are editable with a restore-default action, and existing agents are not changed.

## Permissions and what it reads

- It runs code that an agent wrote, or that you typed, on the daemon host with your user's permissions. Terminal runs use the terminal shell's environment. Background runs inherit the plugin process's environment, without `ELECTRON_RUN_AS_NODE`, with `TERM=dumb` and `PYTHONUNBUFFERED=1` added.
- It writes temporary script files for each run and removes them when the run ends or the plugin stops.
- It reads terminal screen contents to track a run and to build attachments, and sends command output to the agent. It makes no network requests of its own.

## Limits

- Terminal output is read from the screen, so very long lines arrive wrapped and only the last 3,000 rows are visible.
- Run state is held in the plugin process. Reloading the plugin forgets it, and nothing is re-run.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/terminal-integration).*
