Peer Agents lets an agent start another independent agent in a different project on the same host, and send messages to other agents. It adds three tools: `list_peer_projects`, `create_peer_agent` and `send_peer_message`. It requires Paseo 0.9.1 up to (not including) 0.11.0 and a `paseo` CLI on the daemon's `PATH`.

A created agent runs on its own in a new workspace, using the caller's provider and model unless told otherwise, and can run in the project's own directory or in a new worktree. `send_peer_message` reaches any agent on the host by ID, not only agents created this way.

**Permissions.** The tools are added to new Claude, Codex and OpenCode sessions and preapproved, so an agent can start agents and message others without asking you. Pi sessions are left alone.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/peer-agents).*
