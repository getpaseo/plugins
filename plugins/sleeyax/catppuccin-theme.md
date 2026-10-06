Catppuccin theme adds four color schemes to Paseo's Appearance settings: Latte, Frappé, Macchiato, and Mocha. Latte uses a light appearance, while the other three use a dark appearance. Each scheme supplies colors for the background, foreground, raised surfaces, controls, borders, accent, muted foreground, and focus ring.

The manifest requires Paseo 0.9.0 or newer. The plugin has no settings of its own; theme selection uses Paseo's existing Appearance settings.

The client entrypoint registers fixed palette data with Paseo's theme API. This plugin directory contains no server entrypoint or manifest build step. Its theme contribution does not read workspace files, request credentials, or make network calls. The palettes are attributed to Catppuccin under the MIT license.
