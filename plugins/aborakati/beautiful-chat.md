Restyles the chat stream with themed, syntax-highlighted cards for tool calls, reasoning, prompts, replies, and errors. It is built around Oh My Pi (OMP) tool output and applies to agent chats including OMP. It requires Paseo 0.8.0 or newer. Settings cover accent color, fonts, and whether it takes over prompt and reply rendering from Paseo. On desktop and web it also adds its own find bar and a selection toolbar for copying text or adding it to the chat.

Some features run on the daemon host. Syntax highlighting is computed there. Image thumbnails are read from files in the agent's working directory or at an absolute path. File names in cards can ask the daemon to reveal the file in the platform's file manager. Remote image URLs that a model writes into a reply are loaded and shown, and links open only when you click them. Preferences are stored in the client's local storage.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/beautiful-chat).*
