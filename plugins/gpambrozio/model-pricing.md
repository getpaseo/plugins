Model Pricing adds a **Model pricing** sidebar panel with one table of what models cost across Anthropic, OpenAI, Fireworks AI, Ollama Cloud and OpenRouter, so you can compare models without opening each vendor's pricing page.

Each row shows the price per million tokens in and out, the context window, the maximum output, whether the model supports reasoning, tool calls, structured output and a temperature setting, and a relative cost against the cheapest model on screen. You can sort by any column, search by name, and toggle providers. Pressing a row opens the provider's page for that model. On a narrow window each model becomes a card. An em dash means the source did not publish that fact.

## Data sources

The daemon fetches prices from [models.dev](https://models.dev) for Anthropic, OpenAI, Fireworks AI and Ollama Cloud, and from OpenRouter's public model list for OpenRouter. No account or key is needed, and nothing is sent beyond the requests themselves. Prices are cached on the daemon, under a directory located from `PASEO_HOME`, for twelve hours, and **Refresh** asks again. If one source is unreachable the panel keeps showing its last prices with a note on their age. The daemon machine needs network access to `models.dev` and `openrouter.ai`.

## Settings

- **Providers:** one switch per provider. A provider switched off is not shown or fetched. All five are on by default.
- **Input / output blend:** the share of input versus output used for the relative cost column (default 80/20). Displayed prices are unaffected.
- **Only models that can call tools:** on by default. Models that do not report either way are still shown.

## Limits

- Prices are only as current as models.dev or OpenRouter, so check the vendor's page before relying on one.
- Only per-token prices appear. Cached input, batch discounts, image and audio pricing, and minimum charges are not included.
- A model sold both directly and through OpenRouter appears twice.
- Model links are derived from names and can point to a retired page.
- "Ollama" means Ollama Cloud, not models running on your machine.
- Requires Paseo 0.9.0 or newer with plugins enabled.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/model-pricing).*
