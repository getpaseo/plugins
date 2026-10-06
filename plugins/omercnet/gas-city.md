Gas City connects Paseo to a Gas City supervisor, so you can see its cities, sessions, convoys, work items and events from Paseo and, if you turn it on, act on them. It adds a **Gas City** screen to the sidebar and a **Factory** panel in workspaces that map to a Gas City rig.

## What it does

- Discovers the supervisor and shows its cities, health, version and diagnostics.
- Shows city status and recent events, plus sessions and work filtered to a rig. Convoys that have no rig attribution stay visible in mapped workspace views.
- Maps a Paseo workspace to a Gas City rig, either by an explicit mapping you set or by the longest ancestor path: the rig whose path contains the workspace path and is the longest wins. If two rigs tie on path length the mapping is ambiguous, and a workspace outside every rig is unmapped. Both need an explicit mapping in the settings.
- Adds Command Center items **Open Gas City**, **Configure Gas City** and **Open Gas City Factory**.
- Adds `/sling <bead-id> [agent-role]` in a workspace, which opens the Factory panel with a dispatch form filled in. Nothing is sent until you confirm it there.
- With mutations enabled, lets you dispatch a bead to an agent and act on sessions: wake, message, submit, stop, suspend, close and kill, plus responding to pending interactions (allow, deny or answer).

## Setup

Gas City v1.4.1 must be running, with its supervisor's HTTP API reachable from the Paseo daemon. Start it before opening the plugin. The plugin requires Paseo `^0.9.0 || ^0.10.0 || ^0.11.0`.

Settings are host-wide, so every Paseo client connected to the daemon shares them (**Gas City settings**):

| Setting | Default | Effect |
| --- | --- | --- |
| Supervisor endpoint | `http://127.0.0.1:8372` | Where the daemon sends requests. HTTP or HTTPS only; credentials, query strings and fragments are rejected. |
| Allow remote endpoint | off | Without it, the endpoint host must be `localhost` (resolving only to loopback addresses) or a loopback IP address. Turn it on to use any other host. |
| Enable mutations | off | Unlocks dispatch and session actions. Without it the plugin only reads. |
| Refresh interval | 10 seconds | How often the dashboard polls (2 to 60 seconds). |
| Event limit | 100 | Events per page (1 to 500). |
| Workspace mappings | none | Explicit workspace-to-rig mappings that override automatic matching. |

## What it reads, sends and limits

- All requests to Gas City come from the Paseo daemon, not from the app. Reads are `GET` requests for the supervisor's health, cities, status, rigs, sessions, convoys, work items, pending interactions and events. Mutations are `POST` requests to dispatch work and to act on sessions.
- Requests time out after 5 seconds and responses are capped at 4 MiB. Responses are validated, and truncated results are marked.
- Enabling mutations is a safety interlock, not an authorization boundary. Every mutation also needs explicit confirmation in the interface. Gas City itself is responsible for authentication and access control, and the settings are not a place to store credentials.
- With a remote endpoint enabled, the daemon sends requests to that host.
- Chatting with a Gas City session from a Paseo agent view (**Open in Paseo**) is not available with Gas City v1.4.1.
- The plugin is trusted, unsandboxed code.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/gas-city).*
