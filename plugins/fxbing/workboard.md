Workboard is a kanban board for Paseo workspaces and draft tasks. Each active workspace becomes one task. Drafts can hold a title and description before you create or attach a workspace with **Start work**. Moving a card changes its managed workspace status label; an agent finishing does not complete the task. The board shows agent activity separately, plus the PR, CI and review information Paseo supplies.

Configure groups, labels, colors and optional sidebar pinning in the plugin settings. New drafts, unlabeled workspace imports and Start work have independent default groups. Card order is saved within each column; desktop supports dragging, while compact layouts offer ordering controls. The interface follows Paseo's Chinese or English language setting.

The plugin requires Paseo 0.9.1 or later and Node 22 or later on the daemon host. It uses the host session through an internal bridge for operations not exposed by the public plugin API, including label writes. That bridge can need changes after a Paseo upgrade. Native mobile clients have not been verified.

## Data access and archiving

Workboard reads workspace, agent and conversation activity through Paseo and stores drafts, task history and preferences in its host-scoped plugin settings. It changes workspace labels and, when enabled, sidebar pins. Git safety checks run Git commands in workspace directories, including `git ls-remote` against the configured upstream; that command uses the host's normal Git credentials. It does not send conversations to another service.

Automatic archiving is opt-in and off by default. Its delay is configurable from 1 to 365 days, with a 30-day default. It considers only completed or canceled workspaces, checks conversation activity again, and postpones archiving when activity cannot be bounded. Running or waiting agents, running scripts, open terminals, unmanaged worktrees, dirty Git state or an unverified upstream prevent archiving. Archive checks use exact or conservative upper-bound activity times; incomplete observations are marked on cards.

Archiving uses Paseo's native workspace operation, which can stop agents and terminals and remove a managed worktree. Workboard retains uncertain archive outcomes for manual review. Restoring a draft or resolving its board record does not restore a natively archived workspace or deleted worktree.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-workboard).*
