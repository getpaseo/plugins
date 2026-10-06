Skills lists the agent skills available to an agent session, shows where each one comes from, renders its `SKILL.md`, and invokes it. A **Skills** pill above the agent composer shows a count and opens a popover where you pick a skill, read it, and invoke it with arguments. **Open tab** in the popover opens the full Skills panel, which is also reachable from the Command Center.

It works with every provider. For Claude, Codex and Hermes agents it scans skill directories on the daemon host, which gives each skill a source, a path and a rendered body. For other providers it shows only the skills and commands the running session reports.

## Reads and sends

- Reads `SKILL.md` files on the host running the daemon. Claude: project `.claude/skills` directories, the personal `.claude/skills` directory, and skills of installed Claude plugins. Codex: `.agents/skills` and `.codex/skills` from the agent's working directory up to the repository root, then the personal `.agents/skills`, the `skills` directory under the Codex home, and `/etc/codex/skills`. Hermes: `skills` under the Hermes home. `CODEX_HOME` and `HERMES_HOME` move those homes when set on the daemon.
- Asks the live agent session for the commands it reports.
- Invoking a skill sends `/<skill-name> <arguments>` to the agent as an ordinary message. The plugin does not run skills itself or write files.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/skills).*
