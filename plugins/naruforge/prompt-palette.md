Prompt palette keeps a library of saved prompts and adds a **Prompts** pill to an existing agent's composer. You pick a prompt, review its full text and the agent it will go to, and send it explicitly. Prompts are managed in the plugin's settings screen.

Only the previewed body is sent, as a normal message to that agent through the Paseo SDK. The prompt's name and description are not included, and your composer draft and attachments are left alone. A running agent receives the message the way Paseo and its provider normally handle one, and the plugin does not interrupt a turn or answer permission requests. If a send fails, the plugin treats delivery as uncertain, does not retry on its own, and asks you to check the conversation before sending again.

## Storage

The library is saved as plain JSON in the host's plugin settings, shared by that host's clients and separate from other hosts. It is not secret storage, so keep credentials out of prompts. Removing the plugin deletes the library, and there is no import or export.

Sending from the new-agent draft composer is not supported. Requires Paseo 0.8.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/prompt-palette).*
