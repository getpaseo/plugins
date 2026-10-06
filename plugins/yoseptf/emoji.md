Adds Slack-style `:emoji:` autocomplete to the Paseo composer: type a colon and a few letters and pick a match to insert the emoji. It requires Paseo 0.8.0 or newer.

It works on desktop and web only. Paseo's plugin API has no hook into the composer text, so the plugin attaches to the composer's page elements and handles keys while its popup is open, so it depends on Paseo's page structure. The emoji list is bundled, and the plugin has no settings and no daemon component.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/emoji).*
