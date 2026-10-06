PromptKit rewrites the prompt in your composer before you send it. It adds a `PromptKit` pill to each agent's composer and a `/rewrite <prompt>` slash command. The rewrite replaces the composer text, and nothing is sent to the agent automatically, so you review the result first. The plugin refuses a result that is empty, over 20,000 characters, not a plain rewrite of the draft, or that drops or changes a protected literal such as a URL, path, shell command, code block or model or tool name.

The bundled **General** action instructs the model to turn a draft into a clear instruction with a concrete action, checkable constraints and a definition of done, to keep questions as questions, to keep your voice and language, and not to invent files, numbers or requirements. These are instructions to the model, so how well a rewrite follows them depends on the model. You can add custom actions and enable up to 6. To keep a passage exactly as written, wrap it in backticks or a code fence.

## Setup

Paseo 0.9.0 or newer. In the plugin's settings, choose how the rewrite runs:

- **Provider CLI, current agent model** (default): the agent's own provider CLI (`claude`, `codex`, `opencode` or `pi`), which must be on the daemon's `PATH`, runs headlessly with the model the composer shows.
- **Provider CLI, dedicated model**: a provider and model you choose.
- **Direct API**: a request to an endpoint you configure, with presets for Anthropic, Google Gemini, OpenAI, OpenRouter, Groq, Cloudflare Workers AI, a local server, or a custom endpoint.

You can also set the output language (the prompt's own by default), a timeout, per-provider overrides and a debug log.

## API keys

Keys are never kept in the plugin's settings. Each endpoint reads its key at request time from an environment variable of the daemon, a `secrets.json` file on the daemon host, or none for local servers. A missing key fails the rewrite. You can also type a key into the settings screen, which sends it from the app to the daemon, so use that only on a connection you trust.

## Reads and sends

- Reads and replaces the composer text.
- **Provider CLI**: runs the CLI on the daemon host as a separate headless process in a temporary directory removed afterward, so your conversation never receives a rewrite turn, and sends it your draft and the rewrite instructions. Claude runs with tools, hooks, MCP servers, slash commands and session saving disabled. Pi runs with tools, skills, extensions and its session file disabled. OpenCode runs with an agent that has its tools disabled. Codex runs in a read-only sandbox with no approval prompts, and the plugin does not disable its tools. The plugin does not control OpenCode or Codex session storage, so those CLIs may keep a record of the run on the daemon host.
- **Direct API**: sends your draft, the rewrite instructions and the model name to the endpoint with the key in the authentication header.
- The debug log is off by default. When on, it records excerpts of model output, which can include your draft, and never the keys.

On a new agent before its first message, the pill is unavailable, and `/rewrite` can only use a dedicated model or a Direct API endpoint.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/prompt-kit).*
