Tidy Timeline folds noisy conversation rows into compact cards. It runs only in the app, with nothing on the daemon and nothing stored. The author's repository marks this version as archived and says development moved to a different repository.

- **Skill card:** omp expands `/skill:name` into the conversation with the whole `SKILL.md`. The card shows the skill name and line count, and expands to the body with a copy button.
- **Inbox card:** omp delivers subagent replies as `<irc>` blocks, which become one card with a collapsed row per message, showing the sender and a two-line preview.
- **Notice card:** omp's `<system-notice>` for a finished background job becomes a single line with status, duration and line count, expanding to the result preview.
- **Paste card:** a user message of 24 or more lines or 4000 or more characters shows its first three lines with **Show all** and **Copy**, and ANSI color codes are stripped. This applies to every provider, and the other cards depend on omp's injected row formats.

Card bodies render a small markdown subset: paragraphs, headings, lists, fenced and inline code, bold, italic and links, which open in your browser.

## Limits

- Paseo 0.8 streams assistant messages as separate markdown blocks, so while a message streams an injected row can arrive in pieces. A skill card can then show only its header until the agent is reloaded, which refetches whole rows.
- Plugins can only transform user, assistant, reasoning, tool-call, todo, error and compaction rows, so omp's mounted-tool notifications stay as they are.
- Requires Paseo 0.8.0-beta.1 or later.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/tidy-timeline).*
