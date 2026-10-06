Switches the sidebar grouping between Project and Status from keyboard shortcuts and the Command Center, on desktop and web. It requires Paseo 0.8.0 or newer.

Paseo has no API for this, so the plugin operates the sidebar's Display menu through the page and reads Paseo's saved sidebar setting from local storage to confirm the result, which makes it dependent on Paseo's page structure. While shortcut capture is on, it listens for key presses across the whole page, and the shortcuts are stored in local storage.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-display-switcher).*
