Safehouse runs new Paseo agents inside the macOS sandbox, using [Agent Safehouse](https://github.com/eugene1g/agent-safehouse) and `sandbox-exec`, so an agent and the processes it starts can only reach the files its workspace policy allows. It works only when the Paseo daemon runs on a Mac, and it needs the `safehouse` command from Agent Safehouse installed on that Mac.

**Setup.** Open the Safehouse panel and select **Refresh providers**. This adds a sandboxed copy of each harness you have configured, such as Claude, Codex and Pi, to your Paseo provider settings, named like `safehouse-claude` and labelled "· Safehouse". It also writes small launcher scripts and policy files under the `safehouse` folder in your Paseo home. Your original providers are not changed. Run Refresh providers again after changing a provider's configuration or adding a harness.

**Use.** Once set up, agents you start in a workspace use the sandboxed provider automatically. The workspace header toggle turns that on or off for future agents; existing agents keep the provider they have. By default the workspace is writable and the agent gets Safehouse's built-in system, toolchain, network and temporary-directory access. To grant more, edit the workspace's `.safehouse` file from the panel, review the resolved paths, and save it; reload an existing agent to apply it. A missing, unreadable or invalid policy blocks the launch instead of falling back to an unsandboxed one. The plugin makes no network requests of its own.

**Things to know.**
- Codex is switched to full access with no approval prompts, because it cannot nest the macOS sandbox. Safehouse's policy is what limits it.
- The sandbox covers the agent process and its children. The Paseo daemon and any extra MCP services keep their own permissions.
- **Allow Paseo daemon access** is off by default. Turning it on lets the agent use the Paseo CLI against your daemon, which can operate other workspaces and agents outside the sandbox, so enable it only when you want to give the agent that authority.
- Saved policy changes apply to agents launched or reloaded afterward, not to running ones.
