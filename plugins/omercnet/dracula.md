Dracula contributes two Paseo app themes: the dark Dracula Classic palette and the light Alucard Classic palette. Each variant defines background, foreground, raised surface, control, border, accent, muted foreground and focus colors from the corresponding Dracula palette. Paseo expands those seed colors across app surfaces, panels, menus, diffs, terminal colors and other interface elements.

The manifest requires Paseo ^0.9.0, ^0.10.0 or ^0.11.0. Syntax highlighting remains a separate Appearance preference, so the app palette does not select a code highlighting theme.

The published plugin consists of a client theme registration entrypoint and supporting metadata and documentation. It has no daemon entrypoint or install-time build steps. The entrypoint registers palettes without commands, RPC handlers, filesystem operations, process execution, environment reads or network requests.
