GSD Observer shows the state of a GSD project as a read-only board built from the workspace's `.planning` folder. It does not run GSD, create worktrees, merge, or write to planning files.

The board reports statuses as the files record them. Where sources disagree, it flags the disagreement and does not pick one.

## Access

The daemon reads a fixed set of GSD planning files inside the workspace's real `.planning` directory. Symlinks, files that change while being read, and anything resolving outside that directory are refused and shown as warnings. The client receives labels, counts and warnings, and no raw file contents or paths. The plugin makes no network requests and has no terminal, agent or write action.

A file watcher only marks the board as possibly stale when planning files change. The board updates when you refresh it.

Requires Paseo 0.9.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-gsd-observer).*
