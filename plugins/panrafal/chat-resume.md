Adds composer pills to agents that stopped without finishing, so you can continue the work without retyping. It requires Paseo 0.7.2 or newer.

Pills appear on idle or errored agents in two cases. The first is a provider usage-limit or quota stop, including Claude's monthly spend limit and a turn that ended with no output at all after your message. The second is a turn that stopped mid-work without saying why, such as after a daemon restart. Agents with a pending permission request are left alone.

For a quota stop, **Continue** sends a follow-up on the same agent once the parsed renewal time has passed or when no renewal time is found. **Resume when renewed** creates one heartbeat that continues the same agent two minutes after the renewal time. **Handover** opens an editable prompt and a choice of other ready providers and models, then starts a new agent in the same workspace carrying the source agent's labels. The default prompt tells the new agent to read the source agent's history with `paseo inspect` and `paseo logs`. For an unfinished turn you get a single Continue pill that asks the agent to review the conversation and workspace and finish the work.

Detection is heuristic. A turn that ends on a tool call without a closing message reads as unfinished, and a turn whose last tool call was cancelled is treated as a deliberate interruption and gets no pill.

The plugin reads the tail of each agent's timeline through the daemon and, for Claude and Codex, the on-disk transcripts. Resume when renewed runs `paseo heartbeat create` on the daemon host.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/chat-resume).*
