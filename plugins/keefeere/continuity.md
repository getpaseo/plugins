Continuity moves a task to a different provider when the current one stops on a quota or rate-limit error. It creates a new agent on the next provider in a fallback chain, in the same workspace, and gives it a bounded, redacted copy of the previous agent's conversation. The old chat gets a transition card, and a workspace panel links the chats in the chain. Paseo 0.10.1 or later is required.

## Setup

Open the plugin's page in Settings and check the fallback chain. The defaults are Codex then Claude, one provider per entry with an optional model, mode, and thinking level. Automatic failover needs at least two entries, and each fallback provider must be configured and ready in Paseo. A transition always creates a new agent, because the plugin cannot change the provider of an existing one.

## When it triggers

- Quota exhaustion and rate limits trigger a transition by default. Provider overload is off until you turn it on.
- Canceled turns are ignored. Subagents are ignored unless you turn on Include subagents.
- A provider that failed is skipped for 60 minutes after a quota failure and 5 minutes after a rate limit, unless the provider reports its own reset time.
- A chain stops after 3 switches, after 2 consecutive switches without progress (or the chain length, if shorter), or after 5 transitions on the host within 10 minutes. The first two limits are adjustable.
- `/continuity` and the Command Center action start a transition by hand.

## What is sent where

The successor's first prompt carries the original task, the latest request, the latest task list, and a transcript of the most recent messages and tool activity. Selection starts from the newest items and stops when the budget runs out, and the kept items are shown in chronological order. The budget is 60,000 characters in Automatic mode and 200,000 in Full transcript mode, adjustable between 4,000 and 400,000. Common credential patterns are replaced with `[REDACTED]`, though pattern matching cannot catch every secret. The prompt goes through Paseo to the fallback provider, so the transcript leaves the failed provider's session and reaches the next one.

Optional summary: when enabled, the plugin first sends the transcript (default 30,000 characters) to a separate summary provider and model, with a 180-second timeout. The summary then precedes a short verbatim tail of about 15,000 characters. If the summary fails, the plain transcript is used. The summary agent is archived afterward.

Manual file handoff: Compact & move from the composer pill, or a manual transition with the file option, writes the handoff to `.paseo/continuity/` in the project and points the new agent at it. The folder ignores itself in git, and the plugin does not delete the files.

## Composer pill

The pill shows the remaining quota for the current provider. At or below the warning threshold (15% by default) it shows a warning and offers Compact & move to the other providers in the chain. Nothing changes if you ignore it, and automatic failover still happens when the provider actually fails.

The plugin makes no direct network requests. It runs unsandboxed in the Paseo daemon, and it can read agent timelines and create agents in their workspaces.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-continuity).*
