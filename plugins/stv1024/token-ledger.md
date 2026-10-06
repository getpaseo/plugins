TokenLedger records the tokens and cost of each agent turn. It adds a ledger panel for each agent, a cost and context pill in the message box, an overview of all sessions in the sidebar, and an optional usage summary in the timeline after each turn.

Usage is stored locally on the daemon host as token counts, model, duration and outcome for each turn. Prompts and responses are not recorded. When the provider reports a cost, that cost is shown. Otherwise the plugin estimates it, shown as approximate, using your custom prices in `pricing.json` if you set them, then OpenRouter reference prices, then built-in prices.

With OpenRouter reference prices on, which is the default, the plugin requests the public model price list from `openrouter.ai` in the background and caches it. The request carries no token, prompt or usage data. Turn off **OpenRouter reference prices** in the plugin's settings to stop refreshing and stop using those prices.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/token-ledger).*
