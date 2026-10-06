Video Embeds shows video files in the conversation. When an assistant message contains a markdown image whose path ends in `.mp4`, `.webm` or `.mov`, such as `![demo](/path/to/clip.mp4)`, the plugin replaces it with an inline player with controls and sound. An agent can use this to show a screen recording instead of leaving a file path.

Playback works in the desktop app and in the web client. On iOS and Android the plugin shows a placeholder card with the file name instead of a player. A message that also embeds a non-video image is left to Paseo's normal image handling, so its videos are not replaced.

## Setup

Nothing to configure. The plugin ships a skill file that tells agents to embed clips this way, which you link into your agent's skills folder, and otherwise add a line about it to your agent instructions. Without that, agents rarely write video paths.

## What it reads

- When a message is displayed, the daemon reads the file named in the message. It accepts an absolute path, a `~/` path or a path relative to the agent's working directory, so a message from an agent can cause any readable video file on the daemon machine to be read.
- The file must have a supported extension, be a regular file of at most 30 MB, and start with the expected container signature. Otherwise the card says "Video preview unavailable."
- The whole file is sent to the app as base64 over Paseo's plugin connection, which is why the size cap exists. The plugin writes nothing and makes no network requests.

Requires Paseo 0.8.0 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/video-embeds).*
