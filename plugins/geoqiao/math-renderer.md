Math Renderer typesets block LaTeX formulas in completed assistant replies as images, with actions to show and copy the LaTeX source. It is an experimental beta and requires Paseo 0.9.0-beta.1 or newer.

Rendering happens on the daemon host with MathJax and a bundled resvg WASM module, with no external rendering service. Replies stay native while streaming and formulas appear once the reply is complete.

**Limits:**

- Block math only. Inline math stays as source.
- Replies with tables, images or HTML stay entirely native, as do very large replies.
- Matching replies are drawn by the plugin's own simple Markdown renderer, so code highlighting, workspace file interactions and native text selection are not fully reproduced. Do not combine it with other plugins that replace assistant messages.
- Chat Find cannot search rendered formula replies, and the plugin provides a Command Center switch back to native replies for that.
- Native iOS and Android are not accepted as tested.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/math-renderer).*
