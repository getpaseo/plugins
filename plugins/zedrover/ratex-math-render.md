RaTeX renders LaTeX formulas in Paseo conversations. Inline and display math in assistant and user messages is drawn as typeset formulas, and copying a selection gives back the original TeX. The manifest targets Paseo 0.8.0 up to, but not including, 0.12.0.

Rendering happens on the web client only. The daemon turns each formula into drawing instructions using the plugin's bundled `ratex-wasm` module, and the web client draws them with bundled math fonts, so nothing is fetched from a CDN. Native iOS and Android clients show the TeX source instead. Formulas over 4096 characters are rejected.

A message that contains a complete formula is displayed by the plugin's own limited Markdown renderer instead of Paseo's. It is not a full CommonMark implementation, and images appear as their label and URL without being fetched. Messages without a formula keep Paseo's renderer.

On web, clicking a Markdown file link or an inline code path such as `client/message.tsx:105` asks Paseo to open that file. Relative paths resolve against the agent’s working directory. Bare filenames in inline code remain plain code. File opening depends on Paseo’s workspace pane internals and is unavailable on native clients or outside a workspace pane.

A scratchpad, opened from the RaTeX sidebar entry or workspace panel, lets you type TeX and preview it inline or as a display formula.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/ratex-formula).*
