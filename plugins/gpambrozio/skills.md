Skills lists the agent skills available to an agent session, shows where each comes from, renders its `SKILL.md`, and invokes it. A **Skills** pill above the composer opens a list where you read a skill and invoke it with arguments, and a full Skills panel is available from the Command Center.

It works with every provider. For Claude, Codex and Hermes agents it scans skill directories on the daemon host, which gives each skill a source and a rendered body. For other providers it shows only the skills and commands the running session reports.

## Reads and sends

- Reads `SKILL.md` files on the daemon host: project and personal skill directories for Claude (including installed Claude plugins), Codex and Hermes, plus the system Codex skills directory.
- Asks the live agent session for the commands it reports.
- Invoking a skill sends `/<skill-name> <arguments>` to the agent as an ordinary message. The plugin does not run skills itself or write files.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/skills).*
