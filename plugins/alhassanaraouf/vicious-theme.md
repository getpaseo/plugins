Vicious contributes dark and light appearances to Paseo's appearance settings. The palette uses near-black surfaces, pale text, and gold accents in the dark appearance, with reversed background and text colors in the light appearance. It defines colors for the app background, foreground, raised surfaces, controls, borders, accents, muted text, and focus rings.

The manifest requires Paseo 0.8.0 or newer. The plugin contains a client entrypoint that registers fixed color values through Paseo's theme API. It has no server entrypoint or plugin build step.

Its contribution is limited to the supplied appearance palettes. The entrypoint does not read workspace files, conversation content, credentials, or environment variables, and does not make network requests. The package includes the theme source and an MIT license.
