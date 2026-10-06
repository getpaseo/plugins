PromptKit rewrites the prompt in your composer before you send it. It adds a `PromptKit` pill to the composer of each agent and a `/rewrite <prompt>` slash command. The rewrite replaces the composer text. The plugin checks the result before it replaces your text: a rewrite is refused when it is empty, over 20,000 characters, not a plain rewrite of the draft, or when it drops or changes a protected literal such as a URL, absolute path, shell command, code block or model or tool name. Nothing is sent to the agent automatically, so you review the result and send it yourself. On mobile, the pill opens a sheet with your text and **Rewrite** and **Send** buttons.

The one bundled action, **General**, instructs the model to turn a draft into a clear instruction with the concrete action, checkable constraints and a definition of done, to keep questions as questions, to keep your voice and language, and not to invent files, numbers or requirements. These are instructions to the model, so how well a rewrite follows them depends on the model. You can enable up to 6 actions and add your own under Settings, Custom actions, written as action-pack JSON. To keep a passage exactly as written, wrap it in backticks or a code fence.

## Setup

Paseo 0.9.0 or newer is required. Open Settings, Plugins, the menu on `prompt-kit`, then **Settings**. Nothing is saved until you press Save. The rewrite runs one of three ways:

- **Provider CLI, current agent model** (default): the agent's own provider CLI runs headlessly with the model the composer shows. The CLI (`claude`, `codex`, `opencode` or `pi`) must be on the daemon's `PATH`.
- **Provider CLI, dedicated model**: a provider and model you choose from the daemon's provider catalog.
- **Direct API**: PromptKit sends a request to an endpoint you configure. Presets cover Anthropic, Cloudflare Workers AI, Google Gemini, Groq, OpenAI and OpenRouter, a local server (no key), or a custom endpoint speaking one of those protocols. Use **Test** to check the connection and load the model list.

Other settings: output language (same as the prompt by default, or English, Vietnamese, Japanese, Chinese, Korean, Spanish, French, German), timeout (default 25 seconds, up to 10 minutes, though the daemon drops plugin calls at 30 seconds), a debug log, and per-provider CLI or endpoint overrides.

## API keys

Keys are never stored in the plugin's settings document. Each endpoint picks one key source, and the daemon reads the key when a request is made:

- **Environment variable** (default): a variable of the daemon's environment, named in the Key variable field.
- **`secrets.json`**: an entry under `apiKeys` in a `secrets.json` file in a secrets directory on the daemon host (by default `plugin-settings/prompt-kit` in the Paseo data directory).
- **No key**: for local servers.

A missing key fails the rewrite with a clear message, without trying another source. Typing a key into the settings screen also works, but it sends the key from the app to the daemon, so use it only on a connection you trust.

## Reads and sends

- Reads and replaces the text in the composer. This works through the page, so on the web and desktop apps it acts on the composer directly.
- **Provider CLI**: starts the CLI on the daemon host as a separate headless process, so your conversation never receives a rewrite turn. Each run uses a temporary working directory that is removed afterward. The plugin turns off tools for Claude, Pi and OpenCode, and also MCP servers, hooks and session saving for Claude and the session file for Pi. Codex runs with a read-only sandbox and no approval prompts. It sends your draft and the rewrite instructions to that CLI. OpenCode and Codex session storage is not controlled by the plugin, so those CLIs may keep a record of the run on the daemon host. For Codex, the plugin keeps one background `codex app-server` that it stops after 10 minutes without a rewrite and when the plugin stops.
- **Direct API**: sends your draft, the rewrite instructions and the model name to the configured endpoint, with the key in the authentication header. **Test** makes an authenticated GET request to the endpoint.
- The debug log is off by default. When on, it records command lines, timings and excerpts of model output, which can include your draft, and never the keys.
- With Direct API and no endpoint selected, only providers you mapped under Endpoint per provider can rewrite. On a new agent before its first message, the pill is unavailable, and `/rewrite` can only use a dedicated model or a Direct API endpoint.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/prompt-kit).*
