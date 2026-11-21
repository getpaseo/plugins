Browse Jira Cloud tickets by sprint, find tickets assigned to you, and start a Paseo agent from a ticket. The Start dialog lets you edit the prompt and choose a project and model. Use a Git worktree to give the agent a separate checkout. You can also attach a Jira ticket to the first message in a new workspace.

Use Paseo 0.13.2 or later. In Settings → Plugins → Jira, enter your Jira site URL, email and API token. Select the sprint boards to display. Worktree mode requires Git on the daemon host.

The daemon sends your Jira credentials and Jira requests to the configured site. The plugin can update issues and sprints with the permissions of that Jira account. The default agent prompt includes the ticket URL and branch name. The agent needs its own way to read the ticket, such as a Jira MCP server.

The Jira settings also offer a plugin update action. The host update API or Paseo CLI fetches and installs the update from the configured plugin source.
