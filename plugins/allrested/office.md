Shows every agent on a Paseo host as a person at a desk, in a 3D, 2D pixel-art or list view of an office. Each workspace is a room, and agents walk to the kind of work they are doing, such as reading, editing, running a command or running tests. It is a community port of the my-office project for Paseo and is not an official version of it.

Beside the floor is a column with four tabs: Attention (who needs you), Sessions (open an agent's conversation, answer permission requests, or start a new agent), Activity, and a team Chat where an `@` mention prompts an agent. Each room also has a board of tasks and notes. Agents read and post to it with three tools the plugin adds, and a post that names an idle agent wakes it. "Wake agents" and "Agent tools" are switches in the plugin's settings.

Requires Paseo 0.16.0 or later. The 3D floor needs the desktop app or a browser. The phone app shows the 2D floor and the list.

Optional features, all off until you set them up:

- Stand-up notes: on the days you choose, at 8:00, an agent on the host writes a dated entry into a notes file in a folder you set.
- Incident alarm: checks the Jira and Sentry projects you name for new bugs and issues. It needs `ATLASSIAN_BASE_URL`, `ATLASSIAN_EMAIL` and `ATLASSIAN_API_TOKEN`, or `SENTRY_AUTH_TOKEN`, in the daemon's environment. Tokens are never stored in the settings and are sent only to the Jira or Sentry address you configured.
- Host card (Linux only): shows memory, CPU and the processes and ports that agents left running, with a button to close an idle agent's runtime and stop what it left behind. Nothing is stopped unless you press it.

Data: the plugin reads the host's agents, workspaces and the kind of activity each agent is doing, not file names, commands or prompts. The 3D scene makes no network calls. Board text, chat messages and the stand-up prompt go to the host's own agents, and so to whichever provider runs them. Boards, chat, notes state and incidents are stored in an `office/` folder under the Paseo home on the host.

Limits: on stock Paseo 0.16 a session opened in the office has no Stop button, and the Host card cannot close an idle agent's runtime. The Host card does not work on macOS or Windows. A stand-up or incident run missed while the daemon was down is not made up.
