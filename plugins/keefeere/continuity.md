Continuity moves a task to another provider when the current one stops on a quota or rate-limit error. It creates a new agent on the next provider in a fallback chain, in the same workspace, and gives it a copy of the recent conversation so work continues. The old chat gets a transition card, and a workspace panel links the chats in the chain. Paseo 0.10.1 or later is required.

## Setup

Open the plugin's page in Settings and set the fallback chain. The default is Codex then Claude, and each entry can name a model, mode, and thinking level. Automatic failover needs at least two entries, and each fallback provider must be configured and ready in Paseo. A transition always creates a new agent, because the plugin cannot change the provider of an existing one.

## When it switches

- Quota exhaustion and rate limits trigger a switch by default. Provider overload is off until you turn it on.
- Canceled turns are ignored, and subagents are ignored unless you enable them in settings.
- Settings cover the cooldown for a failed provider, limits that stop a chain from switching repeatedly, and a title badge for the new chat.
- `/continuity` and the Command Center action start a switch by hand.
- A composer pill shows remaining quota for the current provider and warns when it runs low. It offers Compact & move to another provider in the chain, and nothing changes unless you use it.

## What is sent where

The next provider receives the original task, your latest request, the latest task list, and a bounded copy of the recent conversation and tool activity. Common credential patterns are replaced with `[REDACTED]`, but pattern matching cannot catch every secret, so treat the transcript as leaving the failed provider's session.

Optionally, you can name a separate summary provider and model. It receives the conversation first and writes a condensed summary that goes ahead of a short excerpt. If the summary fails, the plain conversation is used.

Compact & move, and manual switches that request it, can write the handoff to `.paseo/continuity/` in the project instead. The folder ignores itself in git and the plugin does not delete the files.

The plugin makes no network requests of its own. It runs in the Paseo daemon and can read agent timelines and create agents in their workspaces.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-continuity).*
