Pins adds a **Pins** button above the chat composer that keeps a list of useful links for each workspace, such as a dev preview, a pull request to review, docs or a deliverable. Agents add and update the links as they work, and you open them in your browser from the menu.

Requires Paseo 0.15.4 or later on both the daemon and the app. No accounts or tokens are needed. Turn on **Paseo tools** under Settings → your host → Agents so agents can manage pins.

## What it does

- Agents add, update and remove pins through tools the plugin gives them. A short instruction is appended to every agent's system prompt telling it to keep the list current.
- A pin that changes shows an unread dot and a message explaining what changed. New and changed pins also appear in a summary in the chat after each agent's turn.
- **Keep** protects a pin from agent removal, and pins can be grouped into sections.
- **Find pins** and **Refresh pins** start a temporary agent that looks through recent workspace conversations and proposes pins. It stops after five minutes, and you can cancel it from the status row.
- A `.paseo/pins.json` file in a project can supply links that agents cannot edit or remove.

## Data and access

- Pins and read state are stored on the daemon machine under `~/.local/share/paseo-pins/`, shared by all your devices. Disabling or uninstalling the plugin leaves that data in place.
- Find and Refresh send recent conversation text from the workspace, and any repository files the temporary agent asks to read, to the agent provider you choose in Pins settings. They use that provider's normal allowance or billing. The default, Automatic, uses the workspace agent's provider.
- The temporary agent can only read text files inside the workspace, up to 256 KiB each, without following symlinks. Its permission requests for anything other than the plugin's own tools are denied.
- Pin links must be HTTP or HTTPS addresses without embedded credentials. They open in your device's browser, so a `localhost` link from a remote daemon points at your own device.
- The plugin makes no network requests of its own.
