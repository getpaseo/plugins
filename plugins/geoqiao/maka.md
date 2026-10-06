MaKa adds the MaKa agent as a Paseo provider, so you can start agents that run through your installed MaKa CLI. The author marked it unmaintained on 2026-09-24. It was tested on macOS with MaKa 0.2.0-dev.39.20260916 and Paseo 0.9, and newer MaKa nightlies are not supported. It requires Paseo 0.9.0-beta.1 up to (not including) 0.10.0.

MaKa must already be installed and configured on the daemon host with a working default provider and model. The plugin runs `maka --acp` there with the daemon's environment, and it does not install MaKa, import credentials or change your MaKa profile. It uses whatever model MaKa has configured, and you cannot switch models from Paseo.

**Unsupported:**

- MCP. Paseo's MCP configuration is dropped, so agent-management tools are unavailable in MaKa chats.
- Session history. Chats cannot be imported or restored after a plugin reload or daemon restart.
- Paseo's custom system prompts, provider options and tool policy, which MaKa ignores.
- Questions and forms, image prompts, provider commands and steering.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/maka).*
