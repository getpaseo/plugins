# Trajectory

Inspect an agent’s activity as a ledger grouped into turns and steps, with a visual timeline and a record inspector for messages, reasoning, tool arguments, results and errors.

Requires Paseo 0.11.2 or newer. Open Trajectory from a workspace’s panel menu, header button or the command palette, then choose an active agent. Compact layouts use a full-screen view. Search filters records by text; turn and tool-call controls fold groups, and selecting a row or timeline marker opens its recorded details.

The plugin reads workspace and agent metadata and the selected agent’s existing Paseo timeline. Timeline content, including recorded tool inputs and outputs, is sent from the daemon to the connected client for display. It does not execute the commands shown in those records or send them to an external service.

Only data already exposed by Paseo’s timeline is available. Per-turn usage, model and outcome are not added to the ledger. Older turns retain summaries after their full entries are released from the in-memory cache, so their details can become unavailable and searches then use the retained previews. Searches return at most 500 matching records. This is a view of existing history, not a separate persistent archive.
