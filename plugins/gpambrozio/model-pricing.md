Model Pricing adds a **Model pricing** sidebar panel with one table of what models cost across Anthropic, OpenAI, Fireworks AI, Ollama Cloud and OpenRouter, so you can compare models without opening each vendor's pricing page. Each row shows price per million tokens in and out, context window, maximum output, capability flags (reasoning, tool calls, structured output, temperature) and a relative cost against the cheapest model shown. You can sort, search, and open the provider's page for a model.

Where data comes from: the daemon fetches [models.dev](https://models.dev) for Anthropic, OpenAI, Fireworks AI and Ollama Cloud, and OpenRouter's public model list for OpenRouter. No account or key is needed, and the daemon machine needs network access to `models.dev` and `openrouter.ai`. Prices are cached on the daemon, and if a source is unreachable the panel shows its last prices with a note.

Settings:

- **Providers:** a switch per provider. A provider switched off is not shown or fetched.
- **Input / output blend:** the input versus output mix behind the relative cost column (default 80/20). Displayed prices are unchanged.
- **Only models that can call tools:** on by default.

Limits:

- Prices are only as current as models.dev or OpenRouter, so confirm with the vendor before relying on one.
- Only per-token prices appear, without cached input, batch discounts, image or audio pricing.
- "Ollama" means Ollama Cloud, not models running on your machine.
- Requires Paseo 0.9.0 or newer.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/model-pricing).*
