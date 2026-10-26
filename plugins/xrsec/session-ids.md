View and copy the current agent’s Paseo session ID and underlying CLI session ID from an **IDs** button beside the chat composer. The popover also offers a resume command for recognized providers, including Claude, Codex, Antigravity, Pi, Hermes, OMP and OpenCode. Commands are copied to the clipboard; the plugin does not run them.

Requires Paseo 0.13.0 or later. No account, token or additional tool setup is needed. Use `/ids` or the command center’s “Copy current session IDs” action to copy both IDs, the provider and any available resume command together.

The plugin reads agent session metadata through Paseo and subscribes to agent updates. Longer IDs are masked in the popover, while copying uses the complete value. CLI IDs remain unavailable until the provider supplies session metadata. The plugin adds no separate network connection, server component or filesystem access. Resume commands depend on the provider and the reported session identifier.
