Queens is a logic puzzle you can play while agents work. Place one queen in every row, column and colored region, with no two queens touching, even diagonally. It adds a **Queens** sidebar surface and Command Center entry, plus a **Queens** pill in each agent's composer that opens a playable popover (a sheet on mobile). The pill also shows how many agents are running and notifies you when they all become idle.

Boards run from 5×5 to 14×14 at Beginner, Easy, Medium and Hard, drawn from a catalog of 97,184 puzzles. Click once to mark an X and double-click for a queen. You can drag to mark or erase several Xs, and **Hint**, **Undo** and **Reset** are available. On Paseo 0.11, puzzles also have linkable screen URLs.

## Network and storage

Puzzle data is fetched from a revision-pinned unlisted GitHub Gist on `gist.githubusercontent.com`. The daemon downloads only the size and difficulty group you open, checks it against a SHA-256 digest, and keeps it for the session. The first open of each group needs network access. The fetched content is puzzle data, not code.

Each puzzle's board marks, start and completion times and hint use are saved in host-scoped plugin settings, along with the selected size and difficulty, the current puzzle and completion records, so the surface and the composer game share one saved game. Undo history is rebuilt locally and is not saved. Settings keep up to 256 puzzle states and up to 256 puzzle completion records, and when a limit is exceeded the oldest entries other than the current puzzle are dropped. On Paseo 0.11 the sidebar shows completion records for puzzles solved without help. Paseo 0.9 and 0.10 get the static sidebar and surface through capability detection. Requires Paseo 0.9, 0.10 or 0.11, and the package declares Node 24 or later for the daemon host.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/queens).*
