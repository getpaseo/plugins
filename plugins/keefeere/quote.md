Quote lets you respond to part of an agent's answer. Select text in a chat and a small bar appears with these actions:

- **Quote:** puts the selection into that chat's message box as a quote.
- **Reply:** opens a field at the selection and sends the quote with your reply, or adds both to the message box.
- **Side chat:** asks about the passage in a separate agent next to the main chat.
- **Copy:** copies the selection as Markdown.

## What a side chat shares

A side chat is a new child agent in the same workspace, with the same provider, model, mode and thinking level, under the provider's normal permissions. Paseo cannot fork a conversation, so the plugin sends the child your selected text, your question and the recent conversation from the main chat, shortened to a size budget. The child is told not to change files or run state-changing commands unless you ask it to.

## Limits

- Desktop and web only. iOS and Android use the system selection menu, which a plugin cannot extend.
- Paseo has no plugin API for the message box, so the plugin relies on the app's DOM markup. A later Paseo release can break it.
- With **Default send** set to queue, a reply sent while the agent runs waits inside the plugin and is lost if the app reloads first.

Requires Paseo 0.10.1 or later. The plugin is app-side only and has no daemon code.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/quote).*
