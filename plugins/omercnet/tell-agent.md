Tell Agent lets one agent pass a message to another agent on the same Paseo host. From an agent's composer, run `/tell [--interrupt] <agent or workspace> :: <message>`. The target matches an active agent's title or ID, or a project or workspace name. If a name matches more than one agent, the command fails and lists examples so you can refine it. Running `/tell` with no arguments opens a Tell agent panel for choosing a target and writing the instruction.

## How it works

The plugin does not write into the target's session. It sends an instruction to the agent you are typing in (the source agent) asking it to forward your message to the target agent's ID, and the source agent carries that out. The target agent sees whatever the source agent sends.

If the source agent is busy, the instruction is added to its running turn and is picked up at its next step. Paseo replaces the turn when the provider cannot accept it. Put `--interrupt` first to replace the source agent's current turn instead. Either choice applies only to the source agent.

## Reads and sends

- Lists agents (title, workspace and project names, and IDs) on the host you are connected to, and watches for changes so the target list stays current. Only the first 2,000 agents, most recently updated first, are searched.
- Sends your message text and the target agent's ID to the source agent over the existing host connection.
- Does not reach agents on other hosts, read files, or contact any other service.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/tell-agent).*
