TokenLedger records the tokens and cost of each agent turn. It adds a ledger panel for each agent, a cost and context pill in the message box, an overview of all sessions in the sidebar, and a usage summary line in the timeline after each finished turn.

Each finished turn is stored with its token counts (input, cached, cache writes, output), model, duration and outcome. When the provider reports a cost, that cost is used. Otherwise the cost is estimated from prices and shown as approximate. A turn whose usage stream was interrupted is marked as possibly incomplete.

## Where data is stored

The ledger is a local file in the daemon's data folder, `plugins/token-ledger/ledger.jsonl`, next to a small state file for in-progress turns. The file is trimmed to the most recent 2,000 turns once it grows past 2,200. Prompts and responses are not recorded.

## Settings

Under TokenLedger in plugin settings (host-wide):

- **Timeline summaries** (on by default): adds a usage summary to the agent's timeline after each newly finished turn.
- **Refresh frequency**: Normal refreshes every 3 seconds while a turn is running and every 30 seconds otherwise. Relaxed uses 10 and 60 seconds.
- **OpenRouter reference prices** (on by default): see below.
- **Built-in fallback prices** (on by default): known model prices used when no other price matches.

## Cost estimates and network

Prices are chosen in this order: the cost the provider reported, your custom prices, OpenRouter reference prices, then the built-in prices. To set custom prices, edit `pricing.json` in the plugin's data folder on the host; changes are picked up within 30 seconds.

With OpenRouter reference prices on, the plugin fetches the public model catalog from `openrouter.ai/api/v1/models` in the background and caches it locally. After a successful fetch it does not fetch again for 24 hours. After a failed fetch, a new attempt becomes eligible after about 5 minutes and happens the next time prices are needed, not on a timer. Cached prices are used in the meantime. The request carries no account token and none of your prompts or usage. Turning the setting off stops new refreshes and stops using OpenRouter prices, though a request already in flight can still finish. Reference prices can differ from gateway discounts or Fast Mode charges.

*This plugin entry was imported from [paseo.cafe](https://paseo.cafe/plugins/token-ledger).*
