PromptKit rewrites the prompt in your composer before you send it. It adds a `PromptKit` pill to each agent's composer and a `/rewrite <prompt>` slash command. The rewrite replaces the composer text, and nothing is sent to the agent automatically, so you review the result first. The plugin refuses a result that is empty, over 20,000 characters, not a plain rewrite of the draft, or that drops or changes a protected literal such as a URL, path, shell command, code block or model or tool name.

The bundled **General** action instructs the model to turn a draft into a clear instruction with a concrete action, checkable constraints and a definition of done, to keep questions as questions, to keep your voice and language, and not to invent files, numbers or requirements. These are instructions to the model, so how well a rewrite follows them depends on the model. In Settings → Prompts you can edit General’s instructions without creating another action, or add custom prompts for separate workflows. Resetting General requires confirmation. You can enable up to 6 actions. To keep a passage exactly as written, wrap it in backticks or a code fence.

## Setup

Paseo 0.9.0 or newer. In the plugin's settings, choose how the rewrite runs:

- **Provider CLI, current agent model** (default): the agent's own provider CLI (`claude`, `codex`, `opencode` or `pi`), which must be on the daemon's `PATH`, runs headlessly with the model the composer shows.
- **Provider CLI, dedicated model**: a provider and model you choose.
- **Direct API**: a request to an endpoint you configure, with presets for Anthropic, Google Gemini, OpenAI, OpenRouter, Groq, Cloudflare Workers AI, a local server, or a custom endpoint.

You can also set the output language (the prompt's own by default), a timeout, per-provider overrides and a debug log.

## API keys

Keys are never kept in the plugin's settings. Each endpoint reads its key at request time from an environment variable of the daemon, a `secrets.json` file on the daemon host, or none for local servers. A missing key fails the rewrite. You can also type a key into the settings screen, which sends it from the app to the daemon, so use that only on a connection you trust. Stored keys are written to an owner-only secrets file and are not returned to the app. Writes within one plugin process are serialized; external editors and other processes can still overwrite concurrent changes.

## Reads and sends

- Reads and replaces the composer text.
- **Provider CLI**: runs the CLI on the daemon host as a separate headless process in a temporary directory removed afterward, so your conversation never receives a rewrite turn, and sends it your draft and the rewrite instructions. Claude runs with tools, hooks, MCP servers, slash commands and session saving disabled. Pi runs with tools, skills, extensions and its session file disabled. OpenCode runs with an agent that has its tools disabled. Codex reuses a server process but starts a fresh ephemeral thread for each rewrite, with a read-only sandbox, no approval prompts and tool-related feature flags disabled. Those flags do not establish complete isolation from every installed Codex configuration. A timeout stops the shared Codex server, so it also fails concurrent rewrites using that server. Its temporary directory is removed at shutdown. OpenCode session storage is controlled by that CLI.
- **Direct API**: sends your draft, the rewrite instructions and the model name to the endpoint with the key in the authentication header.
- The debug log is off by default. When on, it records request identifiers, model and timing, CLI argument summaries and output lengths, or the API origin, status and diagnostic headers. It does not trace response bodies or CLI output excerpts. Known API credentials and account identifiers are scrubbed from HTTP error text before it is shown, but other sensitive data echoed by a provider can still appear in its error message.

On a new agent before its first message, the pill is unavailable, and `/rewrite` can only use a dedicated model or a Direct API endpoint.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/prompt-kit).*
