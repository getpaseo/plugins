FirstMate lets you talk to one Paseo agent, the first mate, which runs a crew of other agents for you. The first mate turns each request into a task for a worker, an ordinary Paseo agent that its charter tells to work only inside its own git worktree and branch. The intent is to keep each worker's file changes in the repository apart. Nothing outside the files is isolated, such as ports, databases or other services the workers touch. The first mate briefs each worker, follows it to the end, and reports back with pull requests, investigation findings and the decisions it leaves to you. A **FirstMate** screen shows the chat with the first mate beside a board of its crew. From the board you can watch a worker live and answer its questions and permission prompts, send it a message, interrupt its turn, ask the first mate to relaunch it, or archive it.

## How it works

The plugin does not dispatch workers. It creates a home directory for the first mate containing a charter (`AGENTS.md`), records and watch scripts, then starts a first mate agent in that directory. The first mate starts and supervises workers with Paseo's own agent tools and learns when they finish, fail or ask for permission through Paseo's notifications. The board reads the first mate's records and the live agents.

Each project ships in a delivery mode recorded in the home: `direct-PR` (the worker opens a pull request), `reviewed-PR` (the worker also reviews its own diff, runs the tests and waits for CI) or `local-only` (a clean branch the first mate lands when you say). Adding `+yolo` to a project lets the first mate merge green work on it without asking.

## What the charter does and does not guarantee

The charter tells the first mate never to write to a project (workers do), never to merge a pull request without your word, and never to throw away unlanded work, and it tells workers never to address you directly. It also says the first mate's home is the one place it may write, with exceptions you approve and clones into `projects/` inside the home. These are instructions in the agent's prompt. The plugin does not enforce them, so they hold only as far as the model follows them.

The first mate runs as an ordinary Paseo agent in the mode you launched it with. Workers run in the crew mode you set in the plugin settings, or in the mode the first mate picks when you set none. Those modes decide what each agent can do without asking.

You can edit the charter and add standing orders in the home. Your standing orders outrank the charter except for its hard rules, and an edited charter is kept across plugin updates.

## Setup

- Paseo 0.11.0-beta.2 or newer.
- The first mate needs Paseo's agent tools to start workers and hear from them. They are off by default. The FirstMate screen offers a button that turns them on, and the plugin settings have an **Agent tools** switch. This changes a daemon-wide Paseo setting (`mcp.injectIntoAgents`), so it applies to every agent on the daemon, not only the crew, and only sessions started afterwards get the tools.
- The `paseo` command on the daemon machine. The plugin runs it to find its own files, to interrupt a worker's turn and to rename the first mate's project in the sidebar.
- For the built-in `pr-watch` (below), the `gh` command logged in, and Node.js, on the daemon machine.

Open **FirstMate** in the sidebar, choose the first mate's provider and mode, and launch it, or adopt an agent you already started. Then tell it about a project and ask for work.

## Settings

Under **Settings › Plugins › FirstMate**:

- **First mate**: which agent it is, with **Release** to forget it while the agent keeps running.
- **Home directory**: where the first mate lives. The default is `plugin-data/firstmate/home` under the Paseo home directory. It can be moved only while no first mate is aboard.
- **Crew model and mode**: what workers run, or leave it to the first mate.
- **Agent tools**, and **Refresh every** (how often the board polls).

A **Files** view in the screen lists the home and edits any text file in it. Because the first mate writes there too, saving a file it changed asks whether to load its version or overwrite it.

## Watches

A watch is an executable script in the home's `watches/` folder that runs on a schedule while Paseo is running. The schedule is a crontab line in a comment near the top, read in the daemon machine's local time. Scripts run unsandboxed with your user's permissions, in the home, with `FIRSTMATE_HOME`, `FIRSTMATE_BACKLOG`, `FIRSTMATE_WATCH_NAME` and a state directory of their own in `FIRSTMATE_WATCH_STATE`.

Whatever a run prints to standard output reaches the first mate as one note, and the first mate treats it as your instruction. A watch that relays text from someone else, such as pull request comments, must mark it as quoted. A run that prints nothing does nothing. A run has two minutes and its output is cut at 16,000 characters. A watch still running when it is due again is not started twice, a run missed while Paseo or the machine was off is not made up, and a failed or timed-out run is reported to the first mate once. The first mate adds or changes a watch only when you say so.

The plugin includes `pr-watch`, which runs every five minutes. It reads the pull request URLs in the backlog outside the Done section, looks each one up with `gh`, and tells the first mate when one is merged, closed or reopened, gets a review or comment from someone other than the logged-in account, or has checks turn red or green. GitHub text in the note is quoted and marked as information only. Until you edit `pr-watch`, a new plugin version replaces it. The Watches card on the board lists each watch and switches it off or on.

## What it reads, writes and runs

- It reads the daemon's workspaces and agents, and creates, steers, interrupts and archives agents it labels as crew. Archiving a worker leaves its workspace and worktree in place.
- It writes its config and the first mate's home under `plugin-data/firstmate/` in the Paseo home directory. Files you attach in the chat are written under `uploads/` in the Paseo home directory. Board layout preferences are saved as Paseo plugin settings.
- It runs the `paseo` command and your watch scripts. The plugin is trusted code running next to the daemon.
- A worker you prompt by hand in its own tab is not watched until the first mate next reviews the crew, which its charter says to do about every 30 minutes while work is under way. Steer from the board instead.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/firstmate).*
