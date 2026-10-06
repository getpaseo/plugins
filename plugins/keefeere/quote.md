Quote lets you respond to part of an agent's answer. Select text in a chat and a small bar appears above it with these actions:

- **Quote:** inserts the selection into that chat's message box as a `> quote` so you can add your reply and send it.
- **Reply:** opens a field at the selection. **Enter** sends the quote and your reply, and **Ctrl/⌘+Enter** adds them to the message box instead. While the agent is running, Enter follows **Settings → Default send** (interrupt, steer or queue).
- **Side chat:** asks about the passage in a separate agent in the right-hand panel, so the main thread stays on track. It can be opened as a regular tab, and it is archived with the main chat.
- **Copy:** copies the selection as Markdown.

## What a side chat shares

A side chat is a new child agent in the same workspace, with the same provider, model, mode and thinking level, under the provider's normal permissions. Paseo cannot fork a conversation, so the plugin sends it your chosen quote, your question and the last 8 turns of the main chat as instructions. If the source of the quote is older than those 8 turns, that turn is included too. Turns are clipped to a size budget, so very long ones are shortened or dropped. The side chat is told not to change files or run state-changing commands unless you ask it to.

## Limits

- Desktop and web only. iOS and Android use the system selection menu, which a plugin cannot extend.
- Paseo has no plugin API for the message box, so the plugin relies on the app's DOM markup. A later Paseo release can break it.
- With **Default send** set to queue, a reply sent while the agent runs waits inside the plugin and is lost if the app reloads first.

Requires Paseo 0.10.1 or later. The plugin is app-side only and has no daemon code.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/quote).*
