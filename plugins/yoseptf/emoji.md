Adds Slack-style `:emoji:` autocomplete to the Paseo composer. Type `:` and at least three letters, then pick a match with Enter, Tab, or a click and the shortcode is replaced by the emoji character. It requires Paseo 0.8.0 or newer.

It works on desktop and web only and does nothing on iOS or Android. Paseo's plugin API has no hook into the composer text, so the plugin attaches to the composer's page elements and handles Enter, Tab, arrow, and Esc keys while the popup is open. The emoji list is bundled, and the plugin has no settings and no daemon component.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/emoji).*
