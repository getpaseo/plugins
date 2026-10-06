Mermaid draws `mermaid` code blocks in agent and user messages as diagrams in the chat timeline instead of showing the source. It supports flowcharts and sequence diagrams only. Subgraphs, `style` and `classDef` directives, and other diagram types are not supported. Lines the parser does not recognize are counted under the drawing, and a diagram that cannot be parsed is shown as source.

Diagrams are drawn from the message text when the message renders, and drawing starts while the code block is still streaming. A message that contains a diagram is rendered by the plugin, so the text around the diagram uses a limited Markdown renderer (headings, lists, emphasis and code). Messages without a diagram are left to Paseo. Each diagram has a toolbar for zoom, fit to view, pop out to a larger view, and show code.

The plugin has no settings and needs no setup beyond enabling plugins in Paseo.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/mermaid).*
