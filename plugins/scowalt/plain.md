Paseo Plain adds a **Plain English** button under completed assistant answers that shows a plainer rewrite next to the original. The agent's own conversation is never changed.

**Setup.** It requires Paseo 0.8 (the manifest allows 0.8.0-beta.1 up to, but not including, 0.9.0), Node.js 22.19 or newer, and the Pi coding agent on the daemon's `PATH` with an existing `openai-codex` login. Manual rewriting is off until you enable it in the plugin's settings.

**What is sent.** Rewrites are manual only, with no automatic rewrites. Each one gives Pi a single answer, with code, commands, paths, URLs, quotes and numbers replaced by placeholders, and Pi sends that text to the model provider through your login. Your question, the conversation and project files are not included.

**Limits.**

- The placeholder check rejects rewrites that damage protected content, but meaning can still drift, so compare against the original for important answers.
- Rewrites are cached unencrypted in a private folder under the Paseo home.
- Developed on Linux. macOS and Windows have only been tested with fake workers.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/paseo-plain).*
