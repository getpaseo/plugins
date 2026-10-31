Shows Claude’s task list in expandable rows below the conversation, with the commands and output associated with each task. Expand a task to see its commands, then expand a command to read its output. The active task opens automatically; commands without an active task appear as a plain “Ejecutó N comandos” line.

Requires Paseo >=0.11.2 and <0.12.0 and a Claude provider. If Claude Code does not expose its task tools, enable `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` in the provider environment. Task progress depends on those task events.

The plugin reads the agent’s timeline and saves task and command summaries back into that timeline. It displays commands and their results; it does not execute them or make its own network requests. Output is truncated to 2,000 characters per command, and older output details are removed when the summary exceeds its size budget.

This version hides Paseo’s standard task and tool-call rows for every provider, while generating replacement rows only for Claude agents. With other providers, tool-call rows disappear without a replacement. Use it with Claude sessions. Some interface labels are in Spanish.
