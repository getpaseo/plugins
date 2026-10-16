# Chat Polish

Customize Paseo’s chat timeline, rich text, themes and fonts from a dashboard with live previews. Tool calls become compact rows with expandable output or diffs, thoughts and calls can merge between replies, and image-only replies become thumbnails. Mariana, Paper and Dusk presets can be edited with contrast checks.

Requires Paseo 0.11.2 or newer and npm on the daemon for the plugin’s locked dependency preparation. Open Chat Polish in the sidebar to adjust themes, messages, steps and rich text. For individual tool rows, set Settings → Appearance → Tool call display to Detailed. Theme and font changes apply app-wide and can reload the app; timeline preferences save as you choose them.

## Access and actions

The plugin reads agent timelines, provider/model metadata and the app’s appearance settings. Open desktop agent tabs are followed to assemble merged steps. Theme and timeline preferences are stored on the daemon, shared by clients; desktop appearance changes also update the app’s local settings. The plugin restyles chat, composer, permission cards and diagrams through the desktop/web DOM.

Image previews read PNG, JPEG, GIF or WebP paths referenced in replies from the daemon’s filesystem and send their contents to the connected client. Paths are not restricted to the workspace; files larger than 12 MiB are rejected. Remote image URLs are loaded by the client from the URL in the reply.

Turn recaps are on by default and append changed-file summaries and failed-command excerpts to the agent timeline. The Command Center can toggle recaps and display options, navigate between prompts, or copy the last turn as Markdown to the clipboard. Selecting reply text also offers a popup to copy it as plain text or Markdown. The context-window card’s Compact conversation button sends `/compact` to the selected agent tab. With split panes, it targets the first visible selected tab, which need not be the card’s pane.

The dashboard checks for updates through the local Paseo CLI when opened. Choosing **Update now** runs Paseo’s updater for this plugin, downloads the revision or version selected by the installation source, and restarts the plugin. Registry installations use the registry’s pin; direct Git installations follow their configured source. The CLI must be available to the daemon. No update is installed merely by opening the dashboard.

## Limits

App restyling, font controls, the app theme picker and merged-step discovery use desktop/web app internals. This revision’s client contribution requires desktop or web and does not load on native mobile clients. App updates can break these integrations; turn off Restyle Paseo’s items in the dashboard if styling stops matching. Built-in theme previews are copied from Paseo 0.11.2 and can drift.

Displayed tool output is shortened to 200 lines and 8,000 characters, with edit previews limited to 200 diff rows. The plugin changes presentation and adds recap records; it does not run the tool commands shown in the transcript.
