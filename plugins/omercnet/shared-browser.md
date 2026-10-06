Shared Browser runs one real Chromium browser per workspace on the daemon host and shows that same live page to every connected Paseo client. Viewers and eligible workspace agents act on one running page, with one set of cookies and login state, instead of each client holding a copy. Many viewers can watch at once, and one human at a time holds control. Open it from the Command Center (**Open Shared Browser**), the **Shared Browser** composer pill, or, on Paseo 0.11 and newer, a **Shared Browser (n)** row in the sidebar footer that lists open sessions.

## How it works

- Chromium and its supervisor run on the daemon host, so browsing uses that host's network, including its local development servers. Phones, browsers and desktop apps only receive streamed frames and send input (tap, double-tap, right-click, drag, scroll, text and keys).
- The toolbar has back, forward, reload, an address bar and device presets (Desktop Chrome, iPhone 15 Pro, Pixel 7, iPad Pro 11). Presets emulate the viewport, pixel ratio, touch behavior and user agent in Chromium. They do not run Safari or WebKit.
- Human control is **Take control**, **Release** and **Take over**. Control is a lease that expires after 30 seconds without activity. Agents cannot take control from a human who holds it.
- Each workspace has a private browser profile under `plugin-data/shared-browser/profiles/` in the Paseo data directory. Cookies and logins survive client disconnects and plugin reloads, are kept when a workspace is archived, and must be deleted by hand if no longer wanted. Profiles are local to one daemon host and do not use your personal browser profiles.
- Closing a panel or disconnecting does not close Chromium right away. If no plugin connection returns within 120 seconds, orphaned browsers are closed. Archiving a workspace closes its browser. At most 8 sessions and 16 viewers per session are allowed.

## Agent access

When a new agent is created with a provider that accepts external MCP servers, the plugin adds a local MCP server to it. Existing, resumed, imported and Paseo-internal agents are not changed. The server offers seven tools: `shared_browser_status`, `shared_browser_capture`, `shared_browser_acquire_control`, `shared_browser_release_control`, `shared_browser_navigate`, `shared_browser_input` and `shared_browser_viewport`. It has no arbitrary CDP commands, page JavaScript evaluation, profile access or file access, and its credential is bound to one workspace. Agents can still visit any address the host can reach, so treat it as a capability for agents you trust.

## Setup

- Node.js 24 or newer on the daemon host. Paseo 0.9, 0.10 or 0.11 is required, on the daemon and the app.
- Chromium is downloaded by the plugin's browser runtime when the plugin is installed, and stored with the plugin's data in the Paseo data directory. On Windows the downloader also keeps a cache under the user profile. On Linux ARM64 no download is made, and the plugin uses a non-Snap Chromium at `/usr/bin/chromium` that you install first.
- Optional overrides: `PASEO_SHARED_BROWSER_CHROMIUM_EXECUTABLE` (absolute path to a Chromium to use instead), `PASEO_SHARED_BROWSER_AGENT_BROWSER_BINARY`, `PASEO_HOME` (data root), and `PASEO_SHARED_BROWSER_CHROMIUM_ARGS` for extra Chromium arguments such as `--no-sandbox` on an already isolated CI runner. User-set `AGENT_BROWSER_*` variables are ignored.

## Limits and boundaries

- Downloads, uploads, clipboard sync, media permissions, extensions and passkeys are not available.
- Viewer and control tokens coordinate clients that are already paired with the same daemon. They are not an authorization boundary between those clients.
- Chromium, the supervisor and the plugin run as the daemon's user, with that user's file and network access. Only loopback CDP endpoints are accepted.
- Supervisor communication uses a private Unix socket on Linux and macOS and a named pipe on Windows. On Windows, `agent-browser` uses loopback TCP, so it assumes a single-user machine.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/shared-browser).*
