agy-provider adds **Antigravity**, Google's coding agent, as a Paseo agent provider. Paseo launches Google's official Antigravity ACP server (`agy_acp_server`) and talks to it over the Agent Client Protocol. Models and modes (Default, Auto Edit, YOLO) come from that server and your Google account, so they vary by account.

## What you need first

The plugin does not include the agent. It needs Google's Antigravity ACP server (`agy_acp_server`) on the machine that runs the Paseo daemon, with its companion `localharness_external` executable in the same folder. The ordinary `agy` CLI does not replace the server. The plugin finds the server on the daemon's `PATH`, or at the absolute path in `PASEO_AGY_ACP_BIN`. The variable must be set in the environment that starts the daemon. Without the companion executable, opening a session fails with `Internal error`.

## Signing in

Open a workspace, run **Antigravity: Log in with Google** from the Command Center, and finish the browser sign-in. This opens a terminal named **Antigravity login** in the workspace, in the plugin's own folder, and types `node scripts/login.ts` into it. The helper starts the ACP server, requests its `authenticate` method (`oauth-personal` unless an argument names another), and prints the sign-in link. It needs Node.js 22.18 or later in that terminal. The helper does not read or store the resulting credentials, and the server keeps them.

For a Gemini API key instead, set `GEMINI_API_KEY` in the daemon's environment and set `auth.type` to `gemini-api-key` in the server's `~/.gemini/antigravity-acp/settings.json` (under `GEMINI_HOME` if you override it). This route is untested with a live key.

If the login runs on a remote daemon, the sign-in happens on that machine, and the helper does not relay the browser callback to yours.

## What to know

- **Paseo's system prompts are not applied.** The plugin passes them to the server at session start, and the plugin's verification notes show server version 1.1.1 ignoring them. The plugin does not support workflows that depend on them.
- Choose **Antigravity** in the model picker, or run `paseo run --provider agy "<prompt>"`.
- The plugin has no settings of its own. Its own code (the provider and the login helper) makes no network requests. It launches the ACP server, and the server's own network activity and credential storage are outside the plugin.
- The plugin does not manage the server, its sign-in, or your Antigravity conversations, so removing the plugin does not delete them.

## Tested and untested

The plugin's verification notes cover macOS ARM64 with personal Google sign-in on Paseo 0.8.0 and server 1.1.1: prompts, permission approve and deny, session restore, cancel, and plugin reload and removal. Linux, Windows, enterprise and API-key sign-in, image and audio prompts, and phones are untested. You may see duplicate tool rows and streamed text split into pieces. Steering a running turn and structured output are not implemented.

Requires Paseo 0.8.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/agy-provider).*
