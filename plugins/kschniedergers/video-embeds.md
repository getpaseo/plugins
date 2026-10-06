Video Embeds plays video files that an assistant message embeds as a markdown image, such as `![demo](/path/to/clip.mp4)` with an `.mp4`, `.webm` or `.mov` file. An agent can use it to show a screen recording in the conversation. Playback works in the desktop app and the web client. On iOS and Android the plugin shows a placeholder card with the file name.

## Setup

The plugin ships a skill file that tells agents to embed clips this way. Link it into your agent's skills folder, or add a line about it to your agent instructions.

## Access

When a message is displayed, the daemon reads the file the message names, from an absolute path, a `~/` path or a path relative to the agent's working directory. A message from an agent can therefore cause any video file the daemon's user can read to be read and sent to the app. Only video files up to 30 MB are shown, and anything larger or unreadable shows "Video preview unavailable." The plugin writes nothing and makes no network requests.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/video-embeds).*
