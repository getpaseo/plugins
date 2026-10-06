Antigravity CLI adds **Antigravity** as a Paseo agent provider. Each Paseo session runs Google's official `agy` command in `stream-json` mode, so the work happens in the `agy` you already have installed and signed in, and Paseo shows the turns, tool calls, diffs, and messages. The plugin's own code makes no network requests, and it does not read or write `agy`'s stored sign-in.

It needs `agy` (versions 1.2.9 to 1.2.16 are the ones described) on the daemon machine, Paseo 0.9.1 or later on both the daemon and the app, and Node 24 for the plugin process.

## What you get

- Models come from `agy models`, one per family with its tiers (High, Medium, Low), and are cached for ten minutes.
- Modes: **Default** (review file writes first), **Accept edits**, and **Plan**. Plan mode is implemented by the plugin, not by `agy`. It prefixes the turn with an instruction to investigate read-only and end with a plan, then offers **Implement** or **Keep planning**. This is an instruction to the model, not a sandbox.
- Slash commands: `/plan`, and the `agy` workflows and skills it can expand in this mode (`/goal`, `/grill-me`, `/teamwork-preview`, `/learn`, `/schedule`, `/boost`, `/browser`). Skills and plugin skills are listed from the workspace's `.agents/` folders and from `~/.gemini/` on the daemon machine.
- Subagents appear as rows in the parent timeline and as read-only child sessions, built from `agy`'s own transcript files. If a future `agy` changes that format, the child sessions drop out and the rows remain.
- Questions that `agy` cannot ask in a headless run are relayed as Paseo question cards. The plugin stops the CLI after `agy` auto-answers "User Skipped", so a tool the model ran in the same step has already run.
- Session settings: **Tool approval** (default uses Antigravity's own setting, or skip all permissions with `--dangerously-skip-permissions`), **Sandbox** (passes `--sandbox`, which the plugin's own notes say did not stop a write outside the workspace in testing), **Share Paseo tools with Antigravity**, and an **Agent profile** picker.

Tool permission prompts cannot be shown in Paseo, because `agy` decides approval from its own `toolPermission` setting. The plugin does not support steering a running turn. While a turn is running, a prompt that needs a different `agy` launch from the running one (a slash command, a skill, or a structured-output schema, or a plain message when the running launch used one of those) is refused with a message to wait for the turn to finish. Pressing stop interrupts the running turn. Structured output needs a JSON Schema whose root is an object.

## Sharing Paseo's MCP servers (off by default)

With **Share Paseo tools with Antigravity** turned on for a session, the plugin writes Paseo's MCP servers into `<working directory>/.agents/mcp_config.json` as `paseo-<name>` entries before `agy` starts. Those entries contain whatever credentials the servers use. In a git work tree the plugin adds that file's path to the repository's `.git/info/exclude` (not `.gitignore`) so `git add .` skips it, and removes the line when the last Paseo session there closes. Outside a git work tree, keep the file out of your commits yourself.

When the last session in that folder closes, the plugin removes only its own entries, deletes the file only if it created it, and never overwrites a file that is not valid JSON. `agy mcp list` does not show these entries, because it reads only your global config.

## Multiple accounts

The **Antigravity accounts** sidebar page chooses which account new agents run under. A running agent keeps the account it started with. The screen also lists each account's remaining quota, by running `agy -p /usage --output-format json` under that account when you open the page or press **Refresh** (cached for 5 minutes, nothing polls in the background).

**Default** is the sign-in `agy` already has and is always listed first. Adding accounts is optional. Windows supports Default only.

Each added account is a **shadow home**: a folder under the plugin's data directory that looks like a home directory to `agy`.

- Its top-level entries are links to the entries in your real home directory. `~/.gemini/config` (MCP servers, plugins, skills) is shared through links. The account has its own `.gemini/antigravity-cli/` history and its own `settings.json`, copied from your real one.
- On macOS each account gets its own keychain with an empty password, created in the account's home, made that home's default, and unlocked before each launch. `agy` stores that account's sign-in there. The plugin never reads what `agy` stores in it.
- **Add account** opens `agy`'s own sign-in. On macOS it launches a Terminal window on the daemon's machine from a small script (`sign-in.command`) in the account's folder. Elsewhere it shows the `HOME=… agy` command to run yourself.
- **Remove** deletes only that account's folder, which includes its sign-in and conversation history, and never touches your real home. Removing the active account makes Default active.
- The first launch of a new account may add plugin entries to the shared `~/.gemini/config/config.json`, the same file Default already writes.
- A file a tool creates at the top level of a shadow home stays in that account. The plugin logs it and does not remove it.

## Files it writes and reads

Under the Paseo home directory, in `plugin-data/antigravity-cli/`: saved timeline rows for each conversation (so history can be restored, skipped when a session is not persisted), uploaded images and files for a session, a JSON Schema file for a structured-output turn (these last two are deleted when the session closes), `accounts.json`, and each shadow home.

It reads each account's `antigravity-cli/settings.json` for the tool-permission setting and trusted-workspace list, `agy`'s conversation index database (read-only), and a running subagent's transcript. Workspace-defined agent profiles only appear for workspaces that account has already trusted.

## Limits

- Edit diffs are rebuilt from file snapshots, so a row may have no diff.
- Transient 503s fail the turn, and the next turn relaunches `agy` on the same conversation. An exhausted credits balance fails with a notice suggesting another account.
- Imported conversations resume but do not replay earlier turns.
- The command list is read from disk, not from `agy`, so a skill the CLI refuses can appear in the picker.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/antigravity-cli).*
