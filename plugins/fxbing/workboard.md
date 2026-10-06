Workboard is a kanban board for your Paseo workspaces. Each active workspace is one task, and you can also keep draft tasks that have no workspace yet and start one later with **Start work**.

A task's status is a managed workspace label, so moving a card between groups changes the label, and changing the label in Paseo moves the card. An agent finishing does not complete a task. Existing active workspaces are imported automatically, and ones without a status label land in Inbox without a label being written. Groups, labels, colors and optional sidebar pinning of in-progress workspaces are set in the plugin's settings. The board also shows compact PR, CI and review information that Paseo supplies.

## Version and access

The manifest requires exactly Paseo app and daemon 0.9.1, and the package declares Node 22 or later for the daemon host. Paseo 0.9.1 lets plugins read labels but not write them, so Workboard uses an internal host bridge that reuses the host session to write labels and workspaces. It can need changes on any later Paseo version. The plugin's backend runs unsandboxed beside the daemon, and its README says the mobile clients are not verified.

## Automatic archiving

Automatic archiving is opt-in and off by default. When on, it considers a workspace in a done or canceled group once 30 days have passed since its last verified conversation. It skips workspaces with a running or waiting agent, a running script or an open terminal. It also checks that the Git directory is clean and pushed to its upstream. It postpones the archive if the conversation history is incomplete.

The README warns that archiving can stop agents and terminals and can remove a managed worktree, and that Workboard cannot restore either. Leave this setting off unless you want that behavior.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-workboard).*
