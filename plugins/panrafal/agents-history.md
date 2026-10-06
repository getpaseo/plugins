Adds an "Agents history" sidebar entry that lists every workspace the daemon has had, archived ones included, with the agents that ran in each, and searches what was said in those conversations. Use it to find the workspace where something was discussed weeks ago, since Paseo's own History screen hides archived workspaces. It requires Paseo 0.7.2 or newer.

Search matches workspace and agent names immediately, then searches conversation text on the daemon. Ranked search uses a local full-text index, and a regex mode runs `grep` over the raw transcripts. Filters cover archived state, provider, project, label, and time period. Only providers that keep a transcript file on disk are searchable (Claude Code, Codex, OMP, and Pi). Other providers are listed but cannot be searched.

The plugin reads Paseo's workspace, project, and agent records and the providers' transcript files on the daemon host. From agent records it keeps a fixed set of fields, and the metadata field is dropped when each record is parsed. It stores a copy of user and assistant message text in its own search index under the Paseo home, which is built when you first open the surface and can be deleted and rebuilt. Regex search needs `grep` on the daemon's PATH.

Pressing an archived agent asks whether to restore it, and confirming runs `paseo agent reload` on the daemon host. The plugin does not archive or delete agents, workspaces, or transcripts.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agents-history).*
