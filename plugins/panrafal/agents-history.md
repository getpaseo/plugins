Adds a sidebar view of every workspace the daemon has had, archived ones included, with the agents that ran in each, and searches what was said in those conversations. It is useful for finding where something was discussed weeks ago, since Paseo's own history hides archived workspaces. It requires Paseo 0.7.2 or newer.

Only providers that keep a transcript file on the daemon host are searchable (Claude Code, Codex, OMP, and Pi). Other providers are listed by name but not searched. The plugin reads those transcripts and Paseo's workspace and agent records, and stores a copy of the user and assistant message text in its own search index under the Paseo home. The index can be deleted and rebuilt. Regex search needs `grep` on the daemon's PATH.

Choosing an archived agent asks whether to restore it, and confirming runs `paseo agent reload` on the daemon host. The plugin does not archive or delete agents, workspaces, or transcripts.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agents-history).*
