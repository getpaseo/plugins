Puts an animated mascot on the Paseo composer. It follows the cursor, watches while you type, reacts to your workspace's status, and reacts when you click it. It works in the web app and the desktop app and does nothing on mobile.

## Setup

When it loads, the plugin tries to add a **Mascot** button to the composers of existing agents. For an agent created later, or if a composer has no mascot, open Command Center and run **Mascot: add a mascot to this composer**. The default character is a fox.

## Using it

| Do | Result |
| --- | --- |
| Right click | Opens a picker with 58 characters and a name field (16 characters at most) |
| Left click | Pokes it. Four fast pokes make it dizzy |
| Drag | Moves it anywhere on screen and the position is remembered. Dropped near the composer, it climbs back on |
| Leave it for 10 seconds | It falls asleep and wakes when you move or type |

The mascot also reacts to workspace status: excited when a run starts, delighted when it finishes, surprised when an agent needs you, and dizzy when a run fails.

## What it reads and sends

- It reads mouse movement in the window, and whether you are typing in a text field (the position and size of that field, not the keys or the text).
- It reads the status of the workspace the composer belongs to.
- It saves the selected character, name, and dragged position as one host-wide setting, so every composer on the host shows the same mascot.
- The character images are WebP sprite sheets that the app requests from `koboyo.com/page-mascot/mascots`. Only images are loaded from there, no code.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-mascot).*
