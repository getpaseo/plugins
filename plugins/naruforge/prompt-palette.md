Prompt palette keeps a library of saved prompts and adds a **Prompts** pill to an existing agent's composer. Pick a prompt, review its full text and the host and agent it will go to, then press **Send**. Copy text is also offered.

## Setup

Add prompts under **Settings → Plugins → Prompt Palette**: a name, an optional description and the body. Edit, reorder or delete them, then choose **Save changes** to save the whole library. Changes are local to the open screen until you save. An empty library still shows the pill, which links to settings.

## What gets sent

Only the previewed body is sent, with its whitespace and line breaks preserved, as a normal message to that agent through the Paseo SDK. The name and description are not included. Your composer draft and attachments are left alone and are not part of the send. How a running agent receives the message follows Paseo and the provider's usual behavior. The plugin does not interrupt a turn or answer permission requests.

If a send fails, the plugin treats delivery as uncertain, since the acknowledgement may have been lost. It keeps the preview open and does not retry. Check the conversation, then use the allow-another-send button that says you checked the conversation. That lock does not survive a plugin reload or app restart.

## Storage and limits

The library is saved as ordinary host settings JSON, shared by that host's clients and separate from other hosts. It is not secret storage, so keep credentials out of prompts. It holds up to 100 prompts, with names up to 80, descriptions up to 240 and bodies up to 20,000 JavaScript string code units. Removing the plugin deletes the library, and there is no import or export.

Sending from the new-agent draft composer is not supported. Requires Paseo 0.8.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/prompt-palette).*
