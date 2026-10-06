Solarized adds two color themes to Paseo: Solarized Light and Solarized Dark. Both use the Solarized palette, with separate colors for backgrounds, text, controls, borders, accents and focus rings. The light theme uses an orange accent, while the dark theme uses cyan. The themes appear in Paseo’s appearance settings.

The plugin requires Paseo 0.8.0 or later. Its client entrypoint registers the two palettes through Paseo’s theme contribution API. It has no server entrypoint, runtime dependencies or plugin build step.

The shipped runtime code consists of static color definitions and theme registration. It does not read workspace files, transcripts, credentials or environment variables, and it makes no network requests. Selecting one of these themes changes the app’s color scheme; the plugin does not add workspace tools, composer actions or agent behavior.
