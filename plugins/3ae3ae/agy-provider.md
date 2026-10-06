agy-provider adds **Antigravity**, Google's coding agent, as a Paseo agent provider by launching Google's Antigravity ACP server (`agy_acp_server`) and talking to it over the Agent Client Protocol. Models and modes come from that server and your Google account.

## Setup

The plugin does not include the server. `agy_acp_server`, with its companion `localharness_external` executable beside it, must be on the Paseo daemon machine, either on the daemon's `PATH` or at the absolute path in `PASEO_AGY_ACP_BIN` (set in the environment that starts the daemon). The ordinary `agy` CLI does not replace it. Without the companion executable, opening a session fails with `Internal error`.

Sign in with **Antigravity: Log in with Google** in the Command Center. It opens a workspace terminal that runs the plugin's login helper (`node scripts/login.ts`, Node.js 22.18 or later), which asks the server to authenticate and prints the browser sign-in link. On a remote daemon the sign-in happens on that machine. The helper does not read or store credentials, and the server keeps them. A Gemini API key is an alternative, set through the environment and the server's own settings file, and is untested with a live key.

## Network and limits

- The plugin has no settings, and its own code makes no network requests. The server's network activity and credential storage are outside the plugin.
- **Paseo's system prompts are not applied.** The plugin passes them at session start, and its verification notes show server 1.1.1 ignoring them. Workflows that depend on them are unsupported.
- Verified on macOS ARM64 with personal Google sign-in and Paseo 0.8.0. Linux, Windows, enterprise and API-key sign-in, image and audio prompts, and phones are untested. Tool rows may appear twice and streamed text may split. Steering a running turn and structured output are not implemented.

Requires Paseo 0.8.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agy-provider).*
