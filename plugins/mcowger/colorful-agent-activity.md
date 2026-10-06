Replaces Paseo's reasoning and agent tool-call rows with dense, IDE-style activity rows on desktop, web, and native mobile. It requires Paseo 0.9.0 or newer, and Paseo's Tool call detail must be set to Detailed, because in Overview mode Paseo groups tool calls before plugins can see them. Only public agent tool calls are restyled, and internal orchestrator calls stay native.

Rows show status, file icons, colored diffs, and highlighted shell output, with specialized views for Paseo's own tools and for Exa and GitHub MCP results. Settings choose a palette (Vivid, Soft, or High contrast) and, per row type, whether details stay open always, only for the latest row, or never.

Image reads show an inline thumbnail. A daemon request reads the image file from the agent's working directory or an absolute path, checks the file's contents to confirm it is an image, and returns files up to 3 MiB. Larger files stay as text.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/colorful-agent-activity).*
